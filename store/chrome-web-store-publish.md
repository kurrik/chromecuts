# Chrome Web Store auto-publish (GitHub Actions)

Manual workflow: **Actions → “Publish to Chrome Web Store” → Run workflow**.

Each run:

1. **Resolves a new version** (auto patch bump by default, or explicit / minor / major)
2. Writes it to `src/manifest.json`
3. Zips `src/` and **uploads** to the Chrome Web Store (optional publish)
4. On success: **commits** the version bump, creates tag `vX.Y.Z`, and a **GitHub Release** with the zip attached

Version source of truth: `max(src/manifest.json, highest git tag v*)`, then increment. You normally never hand-tag.

> The **first** listing must be created in the [Developer Dashboard](https://chrome.google.com/webstore/devconsole) (you already submitted). The API is for **updates** after that.

## Required secrets

Repo → **Settings → Secrets and variables → Actions** → New repository secret:

| Secret | Where it comes from |
|--------|---------------------|
| `CHROME_EXTENSION_ID` | Dashboard item URL: `…/detail/EXTENSION_ID` or the item’s ID field |
| `CHROME_CLIENT_ID` | Google Cloud OAuth **Web application** client |
| `CHROME_CLIENT_SECRET` | Same OAuth client |
| `CHROME_REFRESH_TOKEN` | From OAuth Playground (steps below) |

## Fix: Error 400 `invalid_request` (“Chromecuts sent an invalid request”)

That screen almost always means the **OAuth authorize URL is invalid** — not that the extension package is bad.

Common causes:

1. **Deprecated redirect** `urn:ietf:wg:oauth:2.0:oob` (Google rejects this now)
2. OAuth client type is **Desktop** without a matching loopback redirect
3. Redirect URI on the client doesn’t match the one used to sign in
4. Consent screen is in **Testing** and your Google account isn’t a **Test user**
5. Using a different Google account than the Web Store publisher (or Cloud project mismatch)

**Use the official flow below** (Web app client + [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)). Do **not** open hand-built authorize URLs with `oob`.

Also required by Google: **2-Step Verification** enabled on the publisher Google account.

## One-time setup (official Chrome Web Store API method)

Adapted from [Use the Chrome Web Store API](https://developer.chrome.com/docs/webstore/using-api).

### 1. Google Cloud project + API

1. Open [Google Cloud Console](https://console.cloud.google.com/) (ideally the **same** Google account as the Web Store developer).
2. Create or select a project (name can be anything; “Chromecuts” is fine).
3. **APIs & Services → Library** → search **Chrome Web Store API** → **Enable**.

### 2. OAuth consent screen

1. **APIs & Services → OAuth consent screen**
2. User type: **External** → Create  
3. App information:
   - App name: e.g. `ChromeCuts publish` (this is what appears in “Chromecuts sent an invalid request”)
   - User support email: your address
   - Developer contact: your address
4. **Scopes**: skip / Save and Continue (you’ll enter the scope in Playground)
5. **Test users**: **add the Google account that owns the Chrome Web Store listing**
6. Save. Leave the app in **Testing** unless you want to go through verification (not needed for personal publish).

### 3. OAuth client (Web application — not Desktop)

1. **Credentials → Create credentials → OAuth client ID**
2. Application type: **Web application**
3. Name: e.g. `ChromeCuts Web Store upload`
4. **Authorized redirect URIs** — add exactly:

   ```
   https://developers.google.com/oauthplayground
   ```

5. Create → copy **Client ID** and **Client secret**  
   → GitHub secrets `CHROME_CLIENT_ID` / `CHROME_CLIENT_SECRET`

### 4. Get refresh token via OAuth Playground

1. Open [https://developers.google.com/oauthplayground](https://developers.google.com/oauthplayground)
2. Click the **gear** (top right) → check **Use your own OAuth credentials**
3. Paste **Client ID** and **Client secret** → Close
4. In **Input your own scopes**, paste exactly:

   ```
   https://www.googleapis.com/auth/chromewebstore
   ```

5. Click **Authorize APIs**
6. Sign in as the **Web Store publisher** account (must be listed as a Test user)
7. Allow access
8. Click **Exchange authorization code for tokens**
9. Copy **Refresh token** → GitHub secret `CHROME_REFRESH_TOKEN`  
   (Access token is short-lived; the CLI uses the refresh token.)

If Playground still shows `invalid_request`:

- Confirm redirect URI is exactly `https://developers.google.com/oauthplayground` on the **Web** client (no trailing slash mismatch)
- Confirm “Use your own OAuth credentials” is on and matches that client
- Confirm Test users includes the account you’re signing in with
- Try an incognito window / clear site data for accounts.google.com

### 5. Extension ID

In the [Developer Dashboard](https://chrome.google.com/webstore/devconsole), open your item. The ID is in the URL (`/detail/<id>`). Store as `CHROME_EXTENSION_ID`.

## Running the workflow

**Actions → Publish to Chrome Web Store → Run workflow**

| Input | Default | Meaning |
|-------|---------|---------|
| **version** | *(blank)* | Explicit version (e.g. `2.0.0`). Leave blank to auto-increment. |
| **bump** | `patch` | When version is blank: `patch` (1.0.0→1.0.1), `minor` (→1.1.0), or `major` (→2.0.0) |
| **publish** | **off** | Submit for CWS review (off = **draft upload only** / dry run) |
| **create_github_release** | on | Commit manifest bump, tag `vX.Y.Z`, attach zip to a GitHub Release |

Typical dry run: leave **version** blank, **bump** = patch, **publish** unchecked.  
Typical real release: same, but check **publish**.

> **Gotcha fixed:** GitHub passes boolean inputs as strings; an unchecked box used to still run publish. Conditions now use `inputs.publish == true`.

Release only happens **after** a successful store upload, so a failed OAuth/upload does not leave a tag.

## Local helpers

```bash
# Preview next patch version (writes manifest — use git checkout to discard)
python3 scripts/resolve-and-set-version.py --bump patch

# Package current manifest version
./scripts/package-extension.sh
# → store/chromecuts-<version>.zip
```

## Notes

- Each store upload needs a **higher** version than the previous CWS package (auto-bump handles this for git tags/manifest).
- Do not put OAuth secrets in the repo; only GitHub Actions secrets.
- Publisher account must have **2-Step Verification** enabled to publish/update via the API.
- Concurrent runs are serialized (`concurrency` group) so two publishes cannot race on the same version.
