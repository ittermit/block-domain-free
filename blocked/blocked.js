// ============================================================
// blocked.js — Block Domain Free · Blocked Page Logic
// ============================================================

// ─── Parse blocked URL ───────────────────────────────────

const params   = new URLSearchParams(window.location.search);
const blockedUrl = params.get('url') || '';

let hostname = '';
try {
  hostname = new URL(blockedUrl).hostname.replace(/^www\./, '');
} catch { hostname = blockedUrl; }

document.getElementById('domainBadge').textContent = hostname || 'this site';
document.title = `${hostname || 'Site'} — Blocked · Block Domain Free`;

// ─── Record blocked hit ──────────────────────────────────

chrome.runtime.sendMessage({ type: 'BLOCKED_HIT' });

// ─── Motivational quotes ─────────────────────────────────

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "You will never find time for anything. If you want time, you must make it.", author: "Charles Buxton" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "It's not that I'm so smart, it's just that I stay with problems longer.", author: "Albert Einstein" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "Where focus goes, energy flows.", author: "Tony Robbins" },
  { text: "You don't need more time. You need to decide.", author: "Seth Godin" },
  { text: "Concentrate all your thoughts upon the work at hand.", author: "Alexander Graham Bell" },
  { text: "Do the hard jobs first. The easy jobs will take care of themselves.", author: "Dale Carnegie" },
  { text: "Lost time is never found again.", author: "Benjamin Franklin" },
];

const q = QUOTES[Math.floor(Math.random() * QUOTES.length)];
document.getElementById('quoteText').textContent   = q.text;
document.getElementById('quoteAuthor').textContent = `— ${q.author}`;

// ─── Particles ───────────────────────────────────────────

function createParticles() {
  const container = document.getElementById('particles');
  const colors = ['#8b5cf6', '#a855f7', '#6C3CE1', '#6366f1', '#c084fc'];

  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const size  = Math.random() * 6 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left  = Math.random() * 100;
    const dur   = Math.random() * 12 + 8;
    const delay = Math.random() * 10;

    p.style.cssText = `
      width: ${size}px; height: ${size}px;
      background: ${color};
      left: ${left}%;
      animation-duration: ${dur}s;
      animation-delay: -${delay}s;
      box-shadow: 0 0 ${size * 2}px ${color}80;
    `;
    container.appendChild(p);
  }
}

createParticles();

// ─── Buttons ─────────────────────────────────────────────

document.getElementById('btnBack').addEventListener('click', () => {
  if (history.length > 1) {
    history.go(-2); // skip the blocked page itself
  } else {
    window.location.href = 'chrome://newtab';
  }
});

document.getElementById('btnSettings').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
