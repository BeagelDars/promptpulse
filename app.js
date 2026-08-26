/**
 * PromptPulse Frontend Controller
 * Connects directly with the local Node.js Gateway REST & Proxy APIs.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initPlayground();
  initKeyManager();
  initCacheManager();
  initGuardrailsManager();
  initGlobalActions();

  // Initial Data Fetch
  refreshAllData();

  // Auto poll backend for real-time traffic updates every 2 seconds
  setInterval(refreshTelemetryAndLogs, 2000);
});

/* ==========================================================================
   Navigation
   ========================================================================== */
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-item');
  const panes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('pageTitle');

  const titles = {
    analytics: 'Live Cost & Latency Observability',
    playground: 'Gateway Playground & Live Tester',
    keys: 'API Key Manager',
    cache: 'Semantic & Exact Cache Inspector',
    guardrails: 'Budget Guardrails & Upstream Providers',
    integration: 'SDK Setup & cURL Quickstart'
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabKey = btn.dataset.tab;
      
      navButtons.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(`tab-${tabKey}`);
      if (targetPane) targetPane.classList.add('active');

      if (pageTitle && titles[tabKey]) {
        pageTitle.textContent = titles[tabKey];
      }

      if (tabKey === 'keys') loadApiKeys();
      if (tabKey === 'cache') loadCacheInspector();
      if (tabKey === 'guardrails') loadGuardrailSettings();
    });
  });
}

/* ==========================================================================
   Data Fetchers
   ========================================================================== */
async function refreshAllData() {
  await Promise.all([
    refreshTelemetryAndLogs(),
    loadApiKeys(),
    loadCacheInspector(),
    loadGuardrailSettings()
  ]);
}

async function refreshTelemetryAndLogs() {
  try {
    const [statsRes, logsRes] = await Promise.all([
      fetch('/api/stats'),
      fetch('/api/logs')
    ]);

    if (statsRes.ok) {
      const stats = await statsRes.json();
      renderStats(stats);
    }

    if (logsRes.ok) {
      const logs = await logsRes.json();
      renderLogs(logs);
    }
  } catch (err) {
    console.warn('Error fetching telemetry:', err);
  }
}

function renderStats(stats) {
  document.getElementById('statTotalSavings').textContent = `$${stats.totalSavings}`;
  document.getElementById('statCacheHitRate').textContent = stats.hitRate;
  document.getElementById('cardMonthlySpend').textContent = `$${stats.totalSpend}`;
  document.getElementById('cardAvgLatency').textContent = `${stats.avgLatencyMs} ms`;
  document.getElementById('cardTotalRequests').textContent = stats.totalRequests;
  document.getElementById('cardTotalTokens').textContent = stats.totalTokens.toLocaleString();

  const cap = stats.monthlyBudgetCap || 1000;
  document.getElementById('budgetCapText').textContent = `Monthly Budget Cap: $${cap.toFixed(2)}`;

  const pct = Math.min(100, (parseFloat(stats.totalSpend) / cap) * 100);
  document.getElementById('budgetProgressFill').style.width = `${pct}%`;

  const tag = document.getElementById('budgetStatusTag');
  if (pct > 90) {
    tag.className = 'stat-tag danger';
    tag.textContent = 'Critical (90%+)';
  } else if (pct > 70) {
    tag.className = 'stat-tag warning';
    tag.textContent = 'Warning';
  } else {
    tag.className = 'stat-tag success';
    tag.textContent = 'Healthy';
  }
}

function renderLogs(logs) {
  const tbody = document.getElementById('requestsTableBody');
  if (!tbody) return;

  if (!logs || logs.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; color:#94a3b8;">No requests proxied yet. Send a query via the Playground or cURL!</td></tr>';
    return;
  }

  tbody.innerHTML = '';
  logs.forEach(row => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${row.time}</td>
      <td style="font-family: var(--font-mono); color: var(--primary);">${row.endpoint}</td>
      <td>${row.model}</td>
      <td><span style="color: var(--success); font-weight:600;">${row.status}</span></td>
      <td>${row.latency} ms</td>
      <td>${row.tokens}</td>
      <td>$${Number(row.cost).toFixed(4)}</td>
      <td><span class="status-badge ${row.cache === 'HIT' ? 'hit' : 'miss'}">${row.cache}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

/* ==========================================================================
   Playground (Real POST /v1/chat/completions)
   ========================================================================== */
function initPlayground() {
  const form = document.getElementById('simulatorForm');
  const submitBtn = document.getElementById('simSubmitBtn');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const model = document.getElementById('simModel').value;
    const prompt = document.getElementById('simPrompt').value.trim();

    if (!prompt) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Proxying Request...';

    const startTime = Date.now();

    try {
      const res = await fetch('/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer pp_live_default'
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const latency = Date.now() - startTime;
      const data = await res.json();

      const cacheHeader = res.headers.get('X-PromptPulse-Cache') || (data.usage?.prompt_tokens ? 'MISS' : 'HIT');
      const isHit = cacheHeader === 'HIT';

      const tokens = data.usage?.total_tokens || 0;
      const cost = isHit ? 0.0000 : (tokens / 1000) * 0.005;

      document.getElementById('simLatency').textContent = `${latency} ms`;
      document.getElementById('simCost').textContent = `$${cost.toFixed(4)}`;
      document.getElementById('simTokens').textContent = `${tokens} tokens`;
      document.getElementById('simCacheState').textContent = isHit ? 'HIT (Cached & Free)' : 'MISS (Processed)';
      
      const badge = document.getElementById('simStatusBadge');
      badge.className = `stat-tag ${isHit ? 'success' : 'primary'}`;
      badge.textContent = isHit ? 'Cache HIT' : 'Upstream 200 OK';

      const completionText = data.choices?.[0]?.message?.content || JSON.stringify(data, null, 2);
      document.getElementById('simResponseOutput').textContent = completionText;

      refreshTelemetryAndLogs();
      loadCacheInspector();
    } catch (err) {
      document.getElementById('simResponseOutput').textContent = `Error: ${err.message}`;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Query via Gateway';
    }
  });
}

/* ==========================================================================
   API Key Manager
   ========================================================================== */
async function loadApiKeys() {
  try {
    const res = await fetch('/api/keys');
    if (!res.ok) return;
    const keys = await res.json();

    const tbody = document.getElementById('keysTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    keys.forEach(k => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${escapeHtml(k.name)}</strong></td>
        <td><code style="font-family:var(--font-mono); background:#f1f5f9; padding:4px 8px; border-radius:4px;">${k.key}</code></td>
        <td>${new Date(k.created).toLocaleDateString()}</td>
        <td>
          <button class="btn-secondary btn-sm" onclick="copyToClipboard('${k.key}')">Copy</button>
          <button class="btn-ghost btn-sm" onclick="deleteApiKey('${k.id}')">Revoke</button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // Update code snippets with active key if available
    if (keys.length > 0) {
      const activeKey = keys[0].key;
      const snippet = document.getElementById('curlSnippet');
      if (snippet) {
        snippet.querySelector('code').textContent = `curl -X POST http://localhost:8080/v1/chat/completions \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${activeKey}" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello PromptPulse!"}]
  }'`;
      }
    }
  } catch (err) {
    console.warn('Error loading keys:', err);
  }
}

function initKeyManager() {
  document.getElementById('createKeyBtn').addEventListener('click', async () => {
    const name = prompt('Enter a name for this API Key:', 'Client App Key');
    if (!name) return;

    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      if (res.ok) {
        loadApiKeys();
      }
    } catch (err) {
      alert('Failed to create key: ' + err.message);
    }
  });
}

window.deleteApiKey = async function(id) {
  if (!confirm('Are you sure you want to revoke this API key?')) return;
  try {
    await fetch(`/api/keys/${id}`, { method: 'DELETE' });
    loadApiKeys();
  } catch (err) {
    alert('Error revoking key: ' + err.message);
  }
};

window.copyToClipboard = function(text) {
  navigator.clipboard.writeText(text);
  alert('API Key copied to clipboard!');
};

/* ==========================================================================
   Cache Inspector
   ========================================================================== */
async function loadCacheInspector() {
  try {
    const res = await fetch('/api/cache');
    if (!res.ok) return;
    const items = await res.json();

    const tbody = document.getElementById('cacheTableBody');
    if (!tbody) return;

    if (items.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; color:#94a3b8;">Cache is empty. Queries sent through the gateway will be cached here automatically.</td></tr>';
      return;
    }

    tbody.innerHTML = '';
    items.forEach(item => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><code>${item.hash}</code></td>
        <td>${escapeHtml(item.promptSnippet)}</td>
        <td><span class="stat-tag">${item.model}</span></td>
        <td>${item.tokens}</td>
        <td><strong>${item.hits}</strong></td>
        <td style="color:var(--success); font-weight:600;">$${item.savedTotal}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    console.warn('Error loading cache:', err);
  }
}

function initCacheManager() {
  document.getElementById('purgeCacheBtn').addEventListener('click', async () => {
    if (!confirm('Are you sure you want to flush all cached responses?')) return;
    try {
      await fetch('/api/cache', { method: 'DELETE' });
      loadCacheInspector();
      refreshTelemetryAndLogs();
    } catch (err) {
      alert('Error purging cache: ' + err.message);
    }
  });
}

/* ==========================================================================
   Guardrails & Provider Settings
   ========================================================================== */
async function loadGuardrailSettings() {
  try {
    const res = await fetch('/api/settings');
    if (!res.ok) return;
    const settings = await res.json();

    if (document.getElementById('monthlyBudgetCap')) {
      document.getElementById('monthlyBudgetCap').value = settings.monthlyBudgetCap || 1000;
      document.getElementById('dailySoftLimit').value = settings.dailySoftLimit || 50;
      document.getElementById('maxTokensPerReq').value = settings.maxTokensPerReq || 4096;
      document.getElementById('rateLimitRpm').value = settings.rateLimitRpm || 120;
    }
  } catch (err) {
    console.warn('Error loading settings:', err);
  }
}

function initGuardrailsManager() {
  document.getElementById('saveRulesBtn').addEventListener('click', async () => {
    const monthlyBudgetCap = parseFloat(document.getElementById('monthlyBudgetCap').value) || 1000;
    const dailySoftLimit = parseFloat(document.getElementById('dailySoftLimit').value) || 50;
    const maxTokensPerReq = parseInt(document.getElementById('maxTokensPerReq').value, 10) || 4096;
    const rateLimitRpm = parseInt(document.getElementById('rateLimitRpm').value, 10) || 120;

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          monthlyBudgetCap,
          dailySoftLimit,
          maxTokensPerReq,
          rateLimitRpm
        })
      });

      if (res.ok) {
        alert('Guardrail settings saved successfully!');
        refreshTelemetryAndLogs();
      }
    } catch (err) {
      alert('Error saving guardrails: ' + err.message);
    }
  });

  document.getElementById('saveUpstreamBtn').addEventListener('click', async () => {
    const upstreamOpenAiKey = document.getElementById('upstreamOpenAiKey').value.trim();

    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ upstreamOpenAiKey })
      });

      if (res.ok) {
        alert('Upstream provider settings updated!');
        document.getElementById('upstreamOpenAiKey').value = '';
      }
    } catch (err) {
      alert('Error saving upstream key: ' + err.message);
    }
  });
}

function initGlobalActions() {
  document.getElementById('clearLogsBtn').addEventListener('click', async () => {
    try {
      await fetch('/api/logs', { method: 'DELETE' });
      refreshTelemetryAndLogs();
    } catch (err) {
      alert('Error clearing logs: ' + err.message);
    }
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
