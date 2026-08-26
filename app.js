/**
 * OmniStudio All-in-One Power Suite
 * Unified Productivity, AI Cost Estimator, Data Tools & Freelance Rate Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initAiHub();
  initDataTools();
  initMarkdownStudio();
  initRateEngine();
  initTaskManager();
});

/* ==========================================================================
   Navigation
   ========================================================================== */
function initNavigation() {
  const navButtons = document.querySelectorAll('.nav-item');
  const panes = document.querySelectorAll('.tab-pane');
  const pageTitle = document.getElementById('pageTitle');
  const subtitle = document.querySelector('.subtitle');

  const headers = {
    'ai-hub': {
      title: 'AI Cost & Prompt Optimizer',
      desc: 'Calculate LLM token costs, optimize prompt lengths, and simulate speed & cache savings.'
    },
    'data-tools': {
      title: 'Data & Code Utilities',
      desc: 'Format JSON, encode/decode Base64, and generate cryptographic hashes instantly.'
    },
    'text-editor': {
      title: 'Markdown & Text Studio',
      desc: 'Live formatted markdown editing with real-time word and character analytics.'
    },
    'financial': {
      title: 'Business & Freelance Rate Engine',
      desc: 'Determine target billable hourly rates based on lifestyle expenses, taxes, and vacation time.'
    },
    'tasks': {
      title: 'Task & Project Board',
      desc: 'Keep track of daily priorities and project milestones with persistent local storage.'
    }
  };

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabKey = btn.dataset.tab;

      navButtons.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(`tab-${tabKey}`);
      if (targetPane) targetPane.classList.add('active');

      if (headers[tabKey]) {
        pageTitle.textContent = headers[tabKey].title;
        subtitle.textContent = headers[tabKey].desc;
      }
    });
  });
}

/* ==========================================================================
   1. AI Hub & Cost Estimator
   ========================================================================== */
const AI_PRICING = {
  'gpt-4o': { prompt: 5.00, completion: 15.00 },
  'gpt-4o-mini': { prompt: 0.15, completion: 0.60 },
  'claude-3-5-sonnet': { prompt: 3.00, completion: 15.00 },
  'gemini-1.5-pro': { prompt: 3.50, completion: 10.50 },
  'llama-3-70b': { prompt: 0.80, completion: 0.80 }
};

function initAiHub() {
  const modelSelect = document.getElementById('aiModel');
  const promptInput = document.getElementById('aiPromptInput');
  const queriesInput = document.getElementById('aiExpectedQueries');

  function calculateAiCosts() {
    const model = modelSelect.value;
    const text = promptInput.value;
    const monthlyQueries = parseInt(queriesInput.value, 10) || 1000;

    // Approximate tokens (~4 chars per token)
    const promptTokens = Math.max(1, Math.round(text.length / 3.8));
    const estimatedCompletionTokens = Math.round(promptTokens * 0.8) + 50;
    const totalTokensPerQuery = promptTokens + estimatedCompletionTokens;

    const rates = AI_PRICING[model] || AI_PRICING['gpt-4o'];
    const singleCost = ((promptTokens / 1000000) * rates.prompt) + ((estimatedCompletionTokens / 1000000) * rates.completion);
    const monthlySpend = singleCost * monthlyQueries;
    const monthlySavings = monthlySpend * 0.35; // 35% cache assumption

    document.getElementById('calcTokenCount').textContent = `${totalTokensPerQuery.toLocaleString()} tokens`;
    document.getElementById('calcSingleCost').textContent = `$${singleCost.toFixed(4)}`;
    document.getElementById('calcMonthlySpend').textContent = `$${monthlySpend.toFixed(2)} / mo`;
    document.getElementById('calcMonthlySavings').textContent = `$${monthlySavings.toFixed(2)} / mo`;
  }

  modelSelect.addEventListener('change', calculateAiCosts);
  promptInput.addEventListener('input', calculateAiCosts);
  queriesInput.addEventListener('input', calculateAiCosts);

  calculateAiCosts();
}

/* ==========================================================================
   2. Data & Code Utilities
   ========================================================================== */
function initDataTools() {
  const input = document.getElementById('dataToolInput');
  const output = document.getElementById('dataToolOutput');

  // Format JSON
  document.getElementById('btnFormatJson').addEventListener('click', () => {
    try {
      const parsed = JSON.parse(input.value);
      output.value = JSON.stringify(parsed, null, 2);
    } catch (e) {
      output.value = '❌ Invalid JSON: ' + e.message;
    }
  });

  // Base64 Encode
  document.getElementById('btnBase64Encode').addEventListener('click', () => {
    try {
      output.value = btoa(unescape(encodeURIComponent(input.value)));
    } catch (e) {
      output.value = '❌ Encoding error: ' + e.message;
    }
  });

  // Base64 Decode
  document.getElementById('btnBase64Decode').addEventListener('click', () => {
    try {
      output.value = decodeURIComponent(escape(atob(input.value.trim())));
    } catch (e) {
      output.value = '❌ Decoding error: ' + e.message;
    }
  });

  // SHA-256 Hash
  document.getElementById('btnHashSha256').addEventListener('click', async () => {
    try {
      const msgBuffer = new TextEncoder().encode(input.value);
      const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      output.value = hashHex;
    } catch (e) {
      output.value = '❌ Hash error: ' + e.message;
    }
  });

  // Copy Output
  document.getElementById('btnCopyOutput').addEventListener('click', () => {
    if (!output.value) return;
    navigator.clipboard.writeText(output.value);
    alert('Copied output to clipboard!');
  });
}

/* ==========================================================================
   3. Markdown & Text Studio
   ========================================================================== */
function initMarkdownStudio() {
  const mdInput = document.getElementById('markdownInput');
  const mdPreview = document.getElementById('markdownPreview');
  const wordCount = document.getElementById('mdWordCount');
  const charCount = document.getElementById('mdCharCount');

  function renderMarkdown() {
    const raw = mdInput.value;

    // Word & Character count
    const words = raw.trim() ? raw.trim().split(/\s+/).length : 0;
    wordCount.textContent = `${words} words`;
    charCount.textContent = `${raw.length} characters`;

    // Simple Fast Markdown Parser
    let html = raw
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/<li>(.*)<\/li>/gim, '<ul><li>$1</li></ul>')
      .replace(/\n\n/gim, '<br><br>');

    mdPreview.innerHTML = html;
  }

  mdInput.addEventListener('input', renderMarkdown);
  renderMarkdown();
}

/* ==========================================================================
   4. Business & Freelance Rate Engine
   ========================================================================== */
function initRateEngine() {
  const desiredIncomeInput = document.getElementById('desiredAnnualIncome');
  const expensesInput = document.getElementById('annualExpenses');
  const taxRateInput = document.getElementById('taxRatePct');
  const billableHoursInput = document.getElementById('billableHoursPerWeek');
  const weeksVacationInput = document.getElementById('weeksVacation');

  function calculateRates() {
    const takeHome = parseFloat(desiredIncomeInput.value) || 0;
    const expenses = parseFloat(expensesInput.value) || 0;
    const taxRate = (parseFloat(taxRateInput.value) || 0) / 100;
    const hoursPerWeek = parseFloat(billableHoursInput.value) || 20;
    const vacationWeeks = parseFloat(weeksVacationInput.value) || 4;

    const workingWeeks = Math.max(1, 52 - vacationWeeks);
    const totalBillableHours = workingWeeks * hoursPerWeek;

    // Gross needed before taxes: (takeHome + expenses) / (1 - taxRate)
    const grossNeeded = (takeHome + expenses) / Math.max(0.01, (1 - taxRate));
    const hourlyRate = grossNeeded / totalBillableHours;
    const dayRate = hourlyRate * 8;

    document.getElementById('recHourlyRate').textContent = `$${Math.round(hourlyRate)} / hr`;
    document.getElementById('recDayRate').textContent = `$${Math.round(dayRate)} / day`;
    document.getElementById('recGrossRevenue').textContent = `$${Math.round(grossNeeded).toLocaleString()} / yr`;
    document.getElementById('recTotalHours').textContent = `${Math.round(totalBillableHours)} hrs`;
  }

  [desiredIncomeInput, expensesInput, taxRateInput, billableHoursInput, weeksVacationInput].forEach(inp => {
    inp.addEventListener('input', calculateRates);
  });

  calculateRates();
}

/* ==========================================================================
   5. Task & Project Board
   ========================================================================== */
function initTaskManager() {
  const taskInput = document.getElementById('newTaskInput');
  const addBtn = document.getElementById('btnAddTask');
  const list = document.getElementById('tasksList');

  let tasks = loadTasks();

  function loadTasks() {
    try {
      const saved = localStorage.getItem('omnistudio_tasks');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      { id: '1', text: 'Set up OpenAI / Anthropic API gateway routing', completed: true },
      { id: '2', text: 'Benchmark client hourly rates for Q3 consulting', completed: false },
      { id: '3', text: 'Deploy OmniStudio to Vercel and GitHub', completed: true }
    ];
  }

  function saveTasks() {
    localStorage.setItem('omnistudio_tasks', JSON.stringify(tasks));
  }

  function renderTasks() {
    list.innerHTML = '';
    tasks.forEach(t => {
      const div = document.createElement('div');
      div.className = `task-item ${t.completed ? 'completed' : ''}`;
      div.innerHTML = `
        <div class="task-left">
          <input type="checkbox" ${t.completed ? 'checked' : ''} onchange="toggleTask('${t.id}')">
          <span>${escapeHtml(t.text)}</span>
        </div>
        <button class="btn-del-task" onclick="deleteTask('${t.id}')">&times;</button>
      `;
      list.appendChild(div);
    });
  }

  addBtn.addEventListener('click', () => {
    const text = taskInput.value.trim();
    if (!text) return;
    tasks.push({ id: Date.now().toString(), text, completed: false });
    taskInput.value = '';
    saveTasks();
    renderTasks();
  });

  taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBtn.click();
  });

  window.toggleTask = function(id) {
    const t = tasks.find(item => item.id === id);
    if (t) {
      t.completed = !t.completed;
      saveTasks();
      renderTasks();
    }
  };

  window.deleteTask = function(id) {
    tasks = tasks.filter(item => item.id !== id);
    saveTasks();
    renderTasks();
  };

  renderTasks();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
