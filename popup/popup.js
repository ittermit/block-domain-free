// ============================================================
// popup.js — Block Domain Free Popup Logic
// ============================================================

const $ = id => document.getElementById(id);

let currentHostname = '';
let blocklist = [];

// ─── Init ────────────────────────────────────────────────

async function init() {
  // Get current tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (tab?.url) {
    try {
      const url = new URL(tab.url);
      currentHostname = url.hostname.replace(/^www\./, '');
    } catch { currentHostname = ''; }
  }

  // Display hostname
  $('siteHostname').textContent = currentHostname || 'New Tab';

  // Load favicon
  if (currentHostname) {
    const img = document.createElement('img');
    img.src = `https://www.google.com/s2/favicons?sz=32&domain=${currentHostname}`;
    img.onerror = () => img.remove();
    $('siteFavicon').innerHTML = '';
    $('siteFavicon').appendChild(img);
  }

  // Fetch status from background
  chrome.runtime.sendMessage(
    { type: 'GET_STATUS', hostname: currentHostname },
    (res) => {
      if (!res) return;
      blocklist = res.blocklist || [];
      updateSiteCard(res.blocked);
      updateStats(res.stats);
      renderList();
    }
  );
}

// ─── UI Updates ──────────────────────────────────────────

function updateSiteCard(isBlocked) {
  const card   = $('siteCard');
  const toggle = $('blockToggle');
  const status = $('siteStatus');

  toggle.checked = isBlocked;

  if (isBlocked) {
    card.classList.add('is-blocked');
    status.textContent = '🚫 Blocked';
    status.className = 'site-status blocked';
  } else {
    card.classList.remove('is-blocked');
    status.textContent = currentHostname ? '✅ Allowed' : '—';
    status.className = 'site-status allowed';
  }
}

function updateStats(stats = {}) {
  $('statToday').textContent = stats.today ?? 0;
  $('statTotal').textContent = stats.total ?? 0;
}

function renderList() {
  const container = $('listItems');
  $('listCount').textContent = blocklist.length;

  if (blocklist.length === 0) {
    container.innerHTML = '<div class="empty-state">No sites blocked yet</div>';
    return;
  }

  container.innerHTML = '';
  [...blocklist].reverse().forEach(domain => {
    const item = document.createElement('div');
    item.className = 'list-item';
    item.innerHTML = `
      <span class="list-item-domain">${domain}</span>
      <button class="list-item-remove" data-domain="${domain}" title="Unblock">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
        </svg>
      </button>
    `;
    container.appendChild(item);
  });

  // Attach remove listeners
  container.querySelectorAll('.list-item-remove').forEach(btn => {
    btn.addEventListener('click', () => removeSite(btn.dataset.domain));
  });
}

// ─── Actions ─────────────────────────────────────────────

function addSite(domain) {
  domain = domain.replace(/^www\./, '').toLowerCase().trim();
  if (!domain) return;

  // Basic domain validation
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
    showToast('⚠️ Invalid domain');
    return;
  }
  if (blocklist.includes(domain)) {
    showToast('Already blocked');
    return;
  }

  chrome.runtime.sendMessage({ type: 'ADD_SITE', site: domain }, (res) => {
    if (res?.ok) {
      blocklist = res.blocklist;
      renderList();
      if (domain === currentHostname) updateSiteCard(true);
      showToast(`🚫 ${domain} blocked`);
    }
  });
}

function removeSite(domain) {
  chrome.runtime.sendMessage({ type: 'REMOVE_SITE', site: domain }, (res) => {
    if (res?.ok) {
      blocklist = res.blocklist;
      renderList();
      if (domain === currentHostname) updateSiteCard(false);
      showToast(`✅ ${domain} unblocked`);
    }
  });
}

// ─── Events ──────────────────────────────────────────────

$('blockToggle').addEventListener('change', (e) => {
  if (e.target.checked) {
    if (currentHostname) addSite(currentHostname);
    else e.target.checked = false;
  } else {
    removeSite(currentHostname);
  }
});

$('quickAddBtn').addEventListener('click', () => {
  const val = $('quickAddInput').value.trim();
  if (val) {
    addSite(val);
    $('quickAddInput').value = '';
  }
});

$('quickAddInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') $('quickAddBtn').click();
});

$('settingsBtn').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});

// ─── Toast ───────────────────────────────────────────────

let toastTimer;
function showToast(msg) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2000);
}

// ─── Start ───────────────────────────────────────────────
init();
