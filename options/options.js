// ============================================================
// options.js — Block Domain Free · Options Page Logic
// ============================================================

const $ = id => document.getElementById(id);

let blocklist = [];
let stats     = { today: 0, total: 0, date: '' };

// ─── Init ────────────────────────────────────────────────

async function init() {
  const data = await chrome.storage.local.get(['blocklist', 'stats']);
  blocklist = data.blocklist || [];
  stats     = data.stats    || { today: 0, total: 0, date: '' };

  renderList();
  renderStats();
  setupNav();
  setupMasterToggle();
}

// ─── Navigation ──────────────────────────────────────────

function setupNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      const page = item.dataset.page;

      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

      item.classList.add('active');
      $(`page-${page}`).classList.add('active');
    });
  });
}

// ─── Master toggle ───────────────────────────────────────

async function setupMasterToggle() {
  const { enabled = true } = await chrome.storage.local.get('enabled');
  $('masterToggle').checked = enabled;
  $('masterToggle').addEventListener('change', async e => {
    await chrome.storage.local.set({ enabled: e.target.checked });
    showToast(e.target.checked ? '✅ Protection enabled' : '⏸️ Protection paused');
  });
}

// ─── Block List ───────────────────────────────────────────

function renderList() {
  const container = $('blockList');
  $('blockCount').textContent = blocklist.length;

  if (blocklist.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛡️</div>
        <p>Your block list is empty</p>
        <span>Add a site above to get started</span>
      </div>`;
    return;
  }

  container.innerHTML = '';
  [...blocklist].reverse().forEach(domain => {
    const row = document.createElement('div');
    row.className = 'block-item';
    row.innerHTML = `
      <div class="block-dot"></div>
      <div class="block-domain">${domain}</div>
      <button class="btn-remove" data-domain="${domain}" title="Remove">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </button>`;
    container.appendChild(row);
  });

  container.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => removeSite(btn.dataset.domain));
  });
}

async function addSite() {
  const input = $('addInput');
  const domain = input.value.replace(/^www\./, '').toLowerCase().trim();
  input.value = '';

  if (!domain) return;
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    showToast('⚠️ Invalid domain'); return;
  }
  if (blocklist.includes(domain)) {
    showToast('Already in list'); return;
  }

  blocklist.push(domain);
  await chrome.storage.local.set({ blocklist });
  renderList();
  showToast(`🚫 ${domain} blocked`);
}

async function removeSite(domain) {
  blocklist = blocklist.filter(d => d !== domain);
  await chrome.storage.local.set({ blocklist });
  renderList();
  showToast(`✅ ${domain} removed`);
}

$('addBtn').addEventListener('click', addSite);
$('addInput').addEventListener('keydown', e => { if (e.key === 'Enter') addSite(); });

// ─── Export / Import ─────────────────────────────────────

$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([blocklist.join('\n')], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'block-domain-free-list.txt';
  a.click();
  showToast('📤 Exported');
});

$('importBtn').addEventListener('click', () => $('importFile').click());
$('importFile').addEventListener('change', e => {
  const file = e.target.files[0]; if (!file) return;
  const reader = new FileReader();
  reader.onload = async ev => {
    const lines = ev.target.result.split(/\r?\n/).map(l => l.trim().toLowerCase())
      .filter(l => l && /^[a-z0-9.-]+\.[a-z]{2,}$/.test(l));
    const added = lines.filter(l => !blocklist.includes(l));
    blocklist = [...blocklist, ...added];
    await chrome.storage.local.set({ blocklist });
    renderList();
    showToast(`📥 Imported ${added.length} sites`);
  };
  reader.readAsText(file);
  e.target.value = '';
});

// ─── Stats ────────────────────────────────────────────────

function renderStats() {
  $('statToday').textContent = stats.today  || 0;
  $('statTotal').textContent = stats.total  || 0;
  $('statSites').textContent = blocklist.length;
}

$('resetStats').addEventListener('click', async () => {
  if (!confirm('Reset all statistics?')) return;
  stats = { today: 0, total: 0, date: '' };
  await chrome.storage.local.set({ stats });
  renderStats();
  showToast('🗑️ Stats reset');
});

// ─── Clear all ────────────────────────────────────────────

$('clearAll').addEventListener('click', async () => {
  if (!confirm('Remove ALL blocked sites? This cannot be undone.')) return;
  blocklist = [];
  await chrome.storage.local.set({ blocklist });
  renderList();
  renderStats();
  showToast('🗑️ Block list cleared');
});

// ─── Toast ───────────────────────────────────────────────

let toastTimer;
function showToast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
}

// ─── Start ───────────────────────────────────────────────
init();
