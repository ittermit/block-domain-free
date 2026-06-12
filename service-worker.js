// ============================================================
// service-worker.js — Background Service Worker (MV3)
// Handles storage events and tab navigation interception
// ============================================================

const BLOCKED_PAGE = chrome.runtime.getURL('blocked/blocked.html');

// ─── Helpers ────────────────────────────────────────────────

function extractHostname(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

async function getBlockList() {
  const { blocklist = [] } = await chrome.storage.local.get('blocklist');
  return blocklist;
}

async function isBlocked(url) {
  if (!url || url.startsWith(BLOCKED_PAGE)) return false;
  const hostname = extractHostname(url);
  if (!hostname) return false;

  const blocklist = await getBlockList();
  return blocklist.some(entry => {
    const pattern = entry.replace(/^www\./, '').toLowerCase();
    return hostname.toLowerCase() === pattern ||
           hostname.toLowerCase().endsWith('.' + pattern);
  });
}

// ─── Navigation Listener ────────────────────────────────────

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
  if (details.frameId !== 0) return; // main frame only

  const blocked = await isBlocked(details.url);
  if (blocked) {
    const encodedUrl = encodeURIComponent(details.url);
    chrome.tabs.update(details.tabId, {
      url: `${BLOCKED_PAGE}?url=${encodedUrl}`
    });
  }
});

// ─── Message Handler ────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    const { blocklist = [], stats = { total: 0, today: 0, date: '' } } =
      await chrome.storage.local.get(['blocklist', 'stats']);

    const todayStr = new Date().toDateString();
    if (stats.date !== todayStr) {
      stats.today = 0;
      stats.date = todayStr;
    }

    if (msg.type === 'GET_STATUS') {
      const hostname = msg.hostname || '';
      const blocked = blocklist.some(e =>
        hostname === e || hostname.endsWith('.' + e)
      );
      sendResponse({ blocked, blocklist, stats });
    }

    else if (msg.type === 'ADD_SITE') {
      const site = msg.site.replace(/^www\./, '').toLowerCase().trim();
      if (site && !blocklist.includes(site)) {
        blocklist.push(site);
        await chrome.storage.local.set({ blocklist });
      }
      sendResponse({ ok: true, blocklist });
    }

    else if (msg.type === 'REMOVE_SITE') {
      const updated = blocklist.filter(e => e !== msg.site);
      await chrome.storage.local.set({ blocklist: updated });
      sendResponse({ ok: true, blocklist: updated });
    }

    else if (msg.type === 'BLOCKED_HIT') {
      stats.total += 1;
      stats.today += 1;
      await chrome.storage.local.set({ stats });
      sendResponse({ ok: true });
    }

    else if (msg.type === 'GET_BLOCKLIST') {
      sendResponse({ blocklist });
    }
  })();
  return true; // async response
});
