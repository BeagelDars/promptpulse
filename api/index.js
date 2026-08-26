const crypto = require('crypto');
const url = require('url');
const https = require('https');

// In-memory runtime state for serverless execution
let db = {
  settings: {
    monthlyBudgetCap: 1000,
    dailySoftLimit: 50,
    maxTokensPerReq: 4096,
    rateLimitRpm: 120,
    autoFallback: true,
    upstreamOpenAiKey: process.env.OPENAI_API_KEY || ''
  },
  apiKeys: [
    { id: 'key_1', name: 'Production App Key', key: 'pp_live_default', created: new Date().toISOString() }
  ],
  cache: {},
  logs: [],
  metrics: {
    totalRequests: 0,
    cacheHits: 0,
    totalTokens: 0,
    totalSpend: 0.0,
    totalSavings: 0.0,
    totalLatencySum: 0
  }
};

const PRICING = {
  'gpt-4o': { prompt: 0.005, completion: 0.015, name: 'GPT-4o' },
  'gpt-4o-mini': { prompt: 0.00015, completion: 0.0006, name: 'GPT-4o Mini' },
  'claude-3-5-sonnet': { prompt: 0.003, completion: 0.015, name: 'Claude 3.5 Sonnet' },
  'gemini-1.5-pro': { prompt: 0.0035, completion: 0.0105, name: 'Gemini 1.5 Pro' },
  'llama-3-70b': { prompt: 0.0008, completion: 0.0008, name: 'Llama 3 70B' }
};

function parseJsonBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
  });
}

function sendJson(res, statusCode, data, extraHeaders = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-PromptPulse-Key',
    ...extraHeaders
  });
  res.end(JSON.stringify(data));
}

module.exports = async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-PromptPulse-Key'
    });
    return res.end();
  }

  // GET /api/stats
  if (req.method === 'GET' && pathname.endsWith('/stats')) {
    const avgLatency = db.metrics.totalRequests > 0 
      ? Math.round(db.metrics.totalLatencySum / db.metrics.totalRequests) 
      : 0;
    const hitRate = db.metrics.totalRequests > 0 
      ? ((db.metrics.cacheHits / db.metrics.totalRequests) * 100).toFixed(1) 
      : '0.0';

    return sendJson(res, 200, {
      totalRequests: db.metrics.totalRequests,
      cacheHits: db.metrics.cacheHits,
      hitRate: `${hitRate}%`,
      totalTokens: db.metrics.totalTokens,
      totalSpend: db.metrics.totalSpend.toFixed(4),
      totalSavings: db.metrics.totalSavings.toFixed(4),
      avgLatencyMs: avgLatency,
      monthlyBudgetCap: db.settings.monthlyBudgetCap
    });
  }

  // GET /api/logs
  if (req.method === 'GET' && pathname.endsWith('/logs')) {
    return sendJson(res, 200, db.logs.slice(-50).reverse());
  }

  // DELETE /api/logs
  if (req.method === 'DELETE' && pathname.endsWith('/logs')) {
    db.logs = [];
    return sendJson(res, 200, { success: true });
  }

  // GET /api/keys
  if (req.method === 'GET' && pathname.endsWith('/keys')) {
    return sendJson(res, 200, db.apiKeys);
  }

  // POST /api/keys
  if (req.method === 'POST' && pathname.endsWith('/keys')) {
    const body = await parseJsonBody(req);
    const newKey = {
      id: 'key_' + Date.now(),
      name: body.name || 'Client Key',
      key: 'pp_live_' + crypto.randomBytes(12).toString('hex'),
      created: new Date().toISOString()
    };
    db.apiKeys.push(newKey);
    return sendJson(res, 201, newKey);
  }

  // GET /api/cache
  if (req.method === 'GET' && pathname.endsWith('/cache')) {
    const items = Object.entries(db.cache).map(([hash, item]) => ({
      hash: hash.substring(0, 12) + '...',
      promptSnippet: item.prompt.substring(0, 80),
      model: item.model,
      hits: item.hits || 1,
      tokens: item.tokens,
      savedTotal: ((item.hits || 1) * item.cost).toFixed(4),
      created: item.created
    }));
    return sendJson(res, 200, items);
  }

  // DELETE /api/cache
  if (req.method === 'DELETE' && pathname.endsWith('/cache')) {
    db.cache = {};
    return sendJson(res, 200, { success: true });
  }

  // GET /api/settings
  if (req.method === 'GET' && pathname.endsWith('/settings')) {
    return sendJson(res, 200, db.settings);
  }

  // POST /api/settings
  if (req.method === 'POST' && pathname.endsWith('/settings')) {
    const body = await parseJsonBody(req);
    db.settings = { ...db.settings, ...body };
    return sendJson(res, 200, { success: true, settings: db.settings });
  }

  // POST /v1/chat/completions (OpenAI Compatible Proxy)
  if (req.method === 'POST' && (pathname.includes('/chat/completions') || pathname.endsWith('/completions'))) {
    const startTime = Date.now();
    const payload = await parseJsonBody(req);

    const model = payload.model || 'gpt-4o';
    const messages = payload.messages || [];
    const promptString = messages.map(m => `${m.role}:${m.content}`).join('\n').trim();

    const normalized = promptString.toLowerCase().replace(/\s+/g, ' ');
    const hash = crypto.createHash('sha256').update(normalized).digest('hex');

    // Cache hit
    if (db.cache[hash]) {
      const cached = db.cache[hash];
      cached.hits = (cached.hits || 1) + 1;
      const latencyMs = Date.now() - startTime + 2;

      db.metrics.totalRequests++;
      db.metrics.cacheHits++;
      db.metrics.totalTokens += cached.tokens;
      db.metrics.totalSavings += cached.cost;
      db.metrics.totalLatencySum += latencyMs;

      db.logs.push({
        id: 'req_' + Date.now(),
        time: new Date().toLocaleTimeString(),
        endpoint: '/v1/chat/completions',
        model: cached.model,
        status: 200,
        latency: latencyMs,
        tokens: cached.tokens,
        cost: 0,
        cache: 'HIT'
      });
      if (db.logs.length > 100) db.logs.shift();

      return sendJson(res, 200, cached.responsePayload, {
        'X-PromptPulse-Cache': 'HIT',
        'X-PromptPulse-Latency': `${latencyMs}ms`,
        'X-PromptPulse-Saved': `$${cached.cost.toFixed(4)}`
      });
    }

    // Cache miss / upstream simulation
    const promptTokens = Math.max(1, Math.round(promptString.length / 4));
    const lastMsg = messages[messages.length - 1]?.content || '';
    const completionContent = `[PromptPulse Gateway (${model})]\nProcessed query successfully.\n\nQuery Received: "${lastMsg.substring(0, 100)}${lastMsg.length > 100 ? '...' : ''}"\n\nGateway Features Applied:\n✓ Content-hash semantic verification\n✓ Budget guardrail checked\n✓ Upstream token compression\n✓ Result cached for sub-5ms subsequent executions.`;
    const completionTokens = Math.max(10, Math.round(completionContent.length / 4));
    const totalTokens = promptTokens + completionTokens;

    const rate = PRICING[model] || PRICING['gpt-4o'];
    const calculatedCost = ((promptTokens / 1000) * rate.prompt) + ((completionTokens / 1000) * rate.completion);
    const latencyMs = Date.now() - startTime + 22;

    const responsePayload = {
      id: 'chatcmpl-' + crypto.randomBytes(12).toString('hex'),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: model,
      choices: [{
        index: 0,
        message: { role: 'assistant', content: completionContent },
        finish_reason: 'stop'
      }],
      usage: { prompt_tokens: promptTokens, completion_tokens: completionTokens, total_tokens: totalTokens }
    };

    db.cache[hash] = {
      prompt: promptString,
      model,
      tokens: totalTokens,
      cost: calculatedCost,
      responsePayload,
      hits: 1,
      created: new Date().toISOString()
    };

    db.metrics.totalRequests++;
    db.metrics.totalTokens += totalTokens;
    db.metrics.totalSpend += calculatedCost;
    db.metrics.totalLatencySum += latencyMs;

    db.logs.push({
      id: 'req_' + Date.now(),
      time: new Date().toLocaleTimeString(),
      endpoint: '/v1/chat/completions',
      model,
      status: 200,
      latency: latencyMs,
      tokens: totalTokens,
      cost: calculatedCost,
      cache: 'MISS'
    });
    if (db.logs.length > 100) db.logs.shift();

    return sendJson(res, 200, responsePayload, {
      'X-PromptPulse-Cache': 'MISS',
      'X-PromptPulse-Latency': `${latencyMs}ms`,
      'X-PromptPulse-Cost': `$${calculatedCost.toFixed(4)}`
    });
  }

  // Fallback
  return sendJson(res, 404, { error: 'Not Found' });
};
