# Chrome Web Store assets

## Store listing assets

Ready to upload in the [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole):

### Icon

| File | Spec |
|------|------|
| `icon-128.png` | 128×128 |

### Promo tiles (24-bit PNG, no alpha; JPEG copies also provided)

| File | Spec |
|------|------|
| `small-promo-440x280.png` (also `.jpg`) | Small promo · 440×280 |
| `marquee-promo-1400x560.png` (also `.jpg`) | Marquee · 1400×560 |

Sources: `promo/small.html`, `promo/marquee.html`.

### Screenshots (1280×800)

| File | Content |
|------|---------|
| `screenshots/screenshot-1-popup.png` | Marketing frame + toolbar popup with default bindings |
| `screenshots/screenshot-2-mapping.png` | Chrome `[`/`]` vs ChromeCuts `J`/`K` comparison |
| `screenshots/screenshot-3-options.png` | Options page in a simple browser chrome frame |
| `screenshots/screenshot-4-options-full.png` | Options page full bleed |

Store accepts **1280×800** or **640×400**, PNG or JPEG.

## Regenerating

Demo HTML lives in `screenshots/demo/` (static stand-ins because `chrome.*` APIs are unavailable under `file://`). Re-capture with headless Chrome:

```bash
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
cd store/screenshots
"$CHROME" --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1280,800 --force-device-scale-factor=1 \
  --screenshot=screenshot-1-popup.png \
  "file://$PWD/demo/store-popup.html"
# …same for store-feature.html, store-options.html, options.html
```

## Notes

These are **UI captures / composed product shots**, not live photos of the extension running inside a full Chrome session. For a “real” popup screenshot after install, open the extension and capture the OS window (still fine for the store).
