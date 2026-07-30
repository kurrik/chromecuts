# ChromeCuts

A Chrome extension that lets you map **custom keyboard shortcuts** for browser actions — starting with **tab navigation**.

Chrome’s built-in tab shortcuts are limited and hard to remould. ChromeCuts adds a dedicated set of remappable commands (next/prev tab, move tabs, pin, reopen closed, go-to-tab 1–8, and more) that you bind to whatever keys you want.

## Install (unpacked)

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select this folder (`chromecuts`)

You should see **ChromeCuts** in the toolbar.

## Map your shortcuts

1. Go to `chrome://extensions/shortcuts`  
   (or open the extension popup → **Remap keys**)
2. Find **ChromeCuts**
3. Click the pencil next to each action and press your preferred keys
4. Leave a field blank to leave that action unbound

**Important:** Chrome only allows extensions to register global shortcuts through this page. The extension cannot silently steal arbitrary key combos without you assigning them here.

## Default suggestions

Chrome only auto-assigns **four** suggested keys per extension. On install:

| Action           | Suggested key  |
| ---------------- | -------------- |
| Next tab         | `Alt+J` / `⌥J` |
| Previous tab     | `Alt+K` / `⌥K` |
| Move tab left    | `Alt+Shift+K`  |
| Move tab right   | `Alt+Shift+J`  |

All other commands (first/last tab, close, reopen, pin, go-to-tab 1–8, mute, discard, …) ship **unbound** — bind them yourself at `chrome://extensions/shortcuts`.

If a suggested combo doesn’t stick (conflict with another extension or the OS), assign your own on that page.

## Commands included

**Navigate**

- Next / previous tab (wraps around in the current window)
- First / last tab
- Go to tab 1–8

**Arrange**

- Move tab left / right
- Pin / unpin
- Duplicate tab

**Manage**

- Close tab
- Reopen last closed tab (via session restore)
- New tab
- Reload tab
- Mute / unmute
- Discard tab (suspend to free memory)

## Development

```
chromecuts/
  manifest.json      # MV3 manifest + command definitions
  background.js      # Command handlers (tabs / sessions APIs)
  popup.*            # Toolbar popup — bound shortcuts at a glance
  options.*          # Full command list + remap instructions
  commands-ui.js     # Shared UI helpers
  icons/             # Extension icons
```

After editing code: `chrome://extensions` → ChromeCuts → **Reload**.

## Roadmap ideas

- Window management shortcuts (next window, merge tabs, etc.)
- Per-profile export/import of preferred bindings (documentation)
- Optional page-level shortcuts for sites where global keys are taken

## License

MIT
