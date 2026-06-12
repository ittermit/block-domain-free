# Block Domain Free

> A free, open-source Chrome extension that blocks distracting websites to boost your focus and productivity.

[![Deploy GitHub Pages](https://github.com/ittermit/block-domain-free/actions/workflows/deploy-pages.yml/badge.svg)](https://github.com/ittermit/block-domain-free/actions/workflows/deploy-pages.yml)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-8b5cf6?style=flat)
![License](https://img.shields.io/badge/License-MIT-10b981?style=flat)

**🌐 Landing page:** https://ittermit.github.io/block-domain-free/

---

## ✨ Features

- 🚫 **Instant blocking** — block any domain with one click
- ⚡ **Lightning fast** — intercepts requests at `document_start`
- 🎨 **Beautiful block page** — animated, dark-themed with motivational quotes
- 📊 **Focus stats** — tracks blocked attempts today & all time
- 🔒 **100% private** — no telemetry, no accounts, data stays on-device
- 🌐 **Open source** — MIT licensed

## 🚀 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/ittermit/block-domain-free.git
   ```

2. Open Chrome and navigate to `chrome://extensions`

3. Enable **Developer mode** (top-right toggle)

4. Click **Load unpacked** → select the `block-domain-free` folder

5. Pin the extension and start blocking! 🎉

## 📁 Project Structure

```
block-domain-free/
├── manifest.json          # Chrome Extension MV3 manifest
├── service-worker.js      # Background: blocking logic & storage
├── content.js             # Content script: fast first-paint redirect
├── popup/
│   ├── popup.html         # Extension popup UI
│   ├── popup.css          # Popup styles
│   └── popup.js           # Popup logic
├── blocked/
│   ├── blocked.html       # "Site Blocked" page
│   ├── blocked.css        # Block page styles
│   └── blocked.js         # Block page logic & quotes
├── options/
│   ├── options.html       # Settings page
│   ├── options.css
│   └── options.js
├── icons/                 # Extension icons (16/32/48/128px)
├── docs/                  # GitHub Pages landing page
│   ├── index.html
│   └── hero.png
└── .github/
    └── workflows/
        └── deploy-pages.yml  # Auto-deploy to GitHub Pages
```

## 🛠️ How It Works

1. **`content.js`** runs at `document_start` on every page, checks the URL against the blocklist in `chrome.storage.local`, and redirects to the blocked page before the site loads.
2. **`service-worker.js`** handles storage, message passing, and stats tracking.
3. **`popup/`** provides a quick UI to toggle blocking for the current site and manage the list.

## 📄 License

MIT © 2024 — feel free to fork, modify, and distribute.
