# Chrome Web Store auto-publish (GitHub Actions)

Manual workflow: **Actions → “Publish to Chrome Web Store” → Run workflow**.

It zips `src/`, uploads to the Web Store API, and optionally publishes.

> The **first** listing must be created in the [Developer Dashboard](https://chrome.google.com/webstore/devconsole) (you already submitted). The API is for **updates** after that.

## Required secrets

Repo → **Settings → Secrets and variables → Actions** → New repository secret:

| Secret | Where it comes from |
|--------|---------------------|
| `CHROME_EXTENSION_ID` | Dashboard item URL: `…/detail/EXTENSION_ID` or the item’s ID field |
| `CHROME_CLIENT_ID` | Google Cloud OAuth client |
| `CHROME_CLIENT_SECRET` | Same OAuth client |
| `CHROME_REFRESH_TOKEN` | One-time OAuth consent (steps below) |

## One-time Google Cloud + OAuth setup

1. Open [Google Cloud Console](https://console.cloud.google.com/) (same Google account as the Web Store developer).
2. Create or select a project.
3. **APIs & Services → Library** → enable **Chrome Web Store API**.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Desktop app** (or Web; Desktop is simplest for a refresh token).
   - Copy **Client ID** and **Client secret** → store as `CHROME_CLIENT_ID` / `CHROME_CLIENT_SECRET`.
5. If prompted, configure the OAuth consent screen (External is fine for personal use; add your Google account as a test user while in Testing).
6. Get a **refresh token** with the Web Store scope.

### Refresh token (recommended method)

Using [google-api-nodejs-client style](https://developer.chrome.com/docs/webstore/using-api) / common CLI flow:

```bash
# 1) Open this URL in a browser (replace CLIENT_ID). Sign in as the Web Store publisher.
#    Scope must be the Chrome Web Store one:
#    https://www.googleapis.com/auth/chromewebstore

https://accounts.google.com/o/oauth2/v2/auth?response_type=code&scope=https://www.googleapis.com/auth/chromewebstore&access_type=offline&prompt=consent&client_id=CLIENT_ID&redirect_uri=urn:ietf:wg:oauth:2.0:oob

# If "oob" is rejected by Google, use redirect_uri=http://localhost
# and paste the ?code= from the redirect URL instead.
```

Exchange the code:

```bash
curl -s -X POST https://oauth2.googleapis.com/token \
  -d "client_id=CLIENT_ID" \
  -d "client_secret=CLIENT_SECRET" \
  -d "code=AUTH_CODE" \
  -d "grant_type=authorization_code" \
  -d "redirect_uri=urn:ietf:wg:oauth:2.0:oob"
```

Copy `refresh_token` → secret `CHROME_REFRESH_TOKEN`.

Alternative: follow [Chrome’s Using the Chrome Web Store API](https://developer.chrome.com/docs/webstore/using-api) guide, or use a helper such as [chrome-webstore-upload](https://github.com/fregante/chrome-webstore-upload#getting-keys)’s documented auth flow.

## Running the workflow

1. Bump `version` in `src/manifest.json` on `main` **or** pass a higher version in the workflow input (CI-only bump; commit separately if you want git to match).
2. **Actions → Publish to Chrome Web Store → Run workflow**
   - **version** (optional): e.g. `1.0.1`
   - **publish**: checked = upload + publish; unchecked = upload draft only
3. Watch the run; Web Store review may still apply to the new version.

## Local package only (no upload)

```bash
./scripts/package-extension.sh
# → store/chromecuts-<version>.zip
```

## Notes

- Each store upload needs a **higher** `manifest.json` `version` than the previous upload.
- The workflow does **not** commit version bumps back to the repo (avoids needing write tokens). Prefer bumping version in a PR, then running the action.
- Do not put OAuth secrets in the repo; only GitHub Actions secrets.
