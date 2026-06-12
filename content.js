// ============================================================
// content.js — Content Script (runs at document_start)
// Fast first-paint redirect for blocked sites
// ============================================================

(function () {
  const url = window.location.href;
  const BLOCKED_PAGE = chrome.runtime.getURL('blocked/blocked.html');

  // Don't run on the blocked page itself
  if (url.startsWith(BLOCKED_PAGE)) return;

  function extractHostname(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }

  chrome.storage.local.get('blocklist', ({ blocklist = [] }) => {
    const hostname = extractHostname(url);
    if (!hostname) return;

    const blocked = blocklist.some(entry => {
      const pattern = entry.replace(/^www\./, '').toLowerCase();
      return hostname.toLowerCase() === pattern ||
             hostname.toLowerCase().endsWith('.' + pattern);
    });

    if (blocked) {
      // Immediately hide the page content before redirect kicks in
      document.documentElement.style.visibility = 'hidden';
      const encodedUrl = encodeURIComponent(url);
      window.location.replace(
        `${BLOCKED_PAGE}?url=${encodedUrl}`
      );

      // Record the hit
      chrome.runtime.sendMessage({ type: 'BLOCKED_HIT' });
    }
  });
})();
