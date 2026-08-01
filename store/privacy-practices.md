# Chrome Web Store — Privacy practices (copy/paste)

Use these on the item’s **Privacy practices** tab, then **Save Draft**.

## Single purpose description

```
ChromeCuts lets users assign custom keyboard shortcuts for tab navigation and tab management in Chrome (for example next/previous tab, move tab, pin, close, and reopen closed tabs).
```

## Permission justifications

### `tabs`

```
Required to implement tab navigation and management shortcuts: query tabs in the current window, activate a tab by index, move/pin/duplicate/close/reload/mute/discard tabs, and open a new tab. Tab metadata is used only in memory to perform the user’s shortcut action and is never stored, logged, or transmitted.
```

### `sessions`

```
Required only for the “reopen last closed tab” shortcut, which calls chrome.sessions.getRecentlyClosed and chrome.sessions.restore. Session data is read only at the moment the user presses that shortcut and is never stored, logged, or transmitted.
```

## Remote code

Select **No** if the form asks whether the extension uses remote code.

If a free-text justification is still required:

```
This extension does not use remote code. All JavaScript, HTML, and CSS ship inside the extension package. It does not download, eval, or execute code from the network, and it has no content scripts that inject remote scripts.
```

## Data usage / certification

### Does this extension collect user data?

Select **No** (ChromeCuts does not collect, sell, or transmit user data).

If asked to describe data handling when collection is “No”:

```
ChromeCuts does not collect, store, or transmit user data. It does not use analytics, advertising, accounts, or remote servers. Keyboard shortcuts run locally via the Chrome extensions APIs (tabs and sessions) only to perform the requested tab action on the user’s device.
```

### Certify compliance

Check the box certifying that your data usage complies with the [Chrome Web Store Developer Program Policies](https://developer.chrome.com/docs/webstore/program-policies) / Limited Use requirements.

## Privacy policy URL (if the form requires one)

If the dashboard requires a privacy policy URL even for “no data collection” items, host a short page (e.g. GitHub Pages or a `privacy.md` on the repo) that states:

- what the extension does (tab keyboard shortcuts)
- that no user data is collected or transmitted
- permissions used and why (`tabs`, `sessions`)
- contact email for the publisher account

A draft policy text lives in `store/privacy-policy.md` if you need to publish one.
