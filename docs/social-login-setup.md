# Social login setup (Google and Apple)

The "Continue with Google" and "Continue with Apple" buttons only show up once
their secrets are set. Until then the auth pages look exactly like before.

No database changes are needed. Better Auth stores linked Google and Apple
accounts in the existing `account` table. If someone already has an email
account with the same address, the provider account is linked to it.

## How the URLs work

| Environment | Callback URL                                                 |
| ----------- | ------------------------------------------------------------ |
| Production  | `https://watchlist.xnaavii.com/api/auth/callback/{provider}` |
| Local dev   | `http://localhost:3000/api/auth/callback/google` (Google only, Apple requires HTTPS) |
| Previews    | Nothing to register. Previews (`*.petrovic-valpovo.workers.dev`) send the provider back to the production callback, which hands the sign-in back to the preview (Better Auth's OAuth proxy). This only works once this feature is live in production. |

Production must have `BETTER_AUTH_URL=https://watchlist.xnaavii.com`, since
that's what the callback URL is built from.

## Google

1. Open [Google Cloud Console](https://console.cloud.google.com/) and create a
   project (for example "Watchlist"), or pick an existing one.
2. Go to **Google Auth Platform → Branding** and fill in:
   - App name: the app's public name
   - User support email and developer contact email: your email
   - App domain / home page: `https://watchlist.xnaavii.com`
   - Authorized domains: `xnaavii.com`
3. Go to **Audience**, choose **External**, then press **Publish app**. While the
   app is in "Testing", only the test users you list can sign in. The app only
   asks for `openid`, `email` and `profile`, so Google doesn't need to review it.
4. Go to **Clients → Create client** and choose **Web application**.
   - Authorized JavaScript origins:
     - `https://watchlist.xnaavii.com`
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `https://watchlist.xnaavii.com/api/auth/callback/google`
     - `http://localhost:3000/api/auth/callback/google`
5. Copy the **Client ID** and **Client secret**. These are `GOOGLE_CLIENT_ID`
   and `GOOGLE_CLIENT_SECRET`.

## Apple

This needs a paid Apple Developer Program membership.

1. Open [Certificates, Identifiers & Profiles](https://developer.apple.com/account/resources/identifiers/list).
   Your **Team ID** is shown in the top right (and under Membership details).
2. **Create an App ID**: Identifiers → **+** → App IDs → App.
   - Description: `Watchlist`
   - Bundle ID (explicit): `com.xnaavii.watchlist`
   - Under Capabilities, tick **Sign in with Apple**. Continue and register.
3. **Create a Services ID** (this is the web client): Identifiers → **+** → Services IDs.
   - Description: `Watchlist Web` (users see this on the Apple sign-in sheet)
   - Identifier: `com.xnaavii.watchlist.web`. This is `APPLE_CLIENT_ID`.
   - Register it, open it again, tick **Sign in with Apple** and press **Configure**:
     - Primary App ID: `com.xnaavii.watchlist`
     - Domains and Subdomains: `watchlist.xnaavii.com`
     - Return URLs: `https://watchlist.xnaavii.com/api/auth/callback/apple`
   - Save, then Continue and Save again.
4. **Create a key**: Keys → **+**.
   - Name: `Watchlist Sign in with Apple`
   - Tick **Sign in with Apple**, press **Configure** and pick `com.xnaavii.watchlist`.
   - Register, note the **Key ID**, and **download the `.p8` file**. Apple only
     lets you download it once, so keep it somewhere safe like a password
     manager. Never put it in the repo.
5. **Generate the client secret** from the repo:

   ```bash
   APPLE_TEAM_ID=<team id> APPLE_KEY_ID=<key id> APPLE_CLIENT_ID=com.xnaavii.watchlist.web \
     pnpm auth:apple-secret ~/Downloads/AuthKey_<key id>.p8
   ```

   The printed token is `APPLE_CLIENT_SECRET`.

> **The Apple secret expires after 6 months** (Apple's maximum). The script
> prints the expiry date. Run it again before then and update the secret, or
> Apple sign-in starts failing.

## Adding the secrets

Production (Cloudflare dashboard → Workers & Pages → `movie-watchlist` →
Settings → Variables and Secrets → **Add**, type **Secret**):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `APPLE_CLIENT_ID`
- `APPLE_CLIENT_SECRET`

Or from the terminal, one at a time: `pnpm wrangler secret put GOOGLE_CLIENT_SECRET`.

Use the **Secret** type, not plain text. Plain-text variables get replaced by
the `vars` in `wrangler.jsonc` on every deploy, secrets don't. Preview
deployments use the same secrets automatically.

Local dev: add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`.
