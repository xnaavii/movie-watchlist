# Google sign-in setup

The "Continue with Google" button only shows up once its secrets are set. Until then the auth pages look exactly like before.

No database changes are needed. Better Auth stores linked Google
accounts in the existing `account` table. If someone already has an email
account with the same address, the Google account is linked to it.

## How the URLs work

| Environment | Callback URL                                                 |
| ----------- | ------------------------------------------------------------ |
| Production  | `https://watchlist.xnaavii.com/api/auth/callback/google` |
| Local dev   | `http://localhost:3000/api/auth/callback/google` |
| Previews    | Nothing to register. Previews (`*.petrovic-valpovo.workers.dev`) send Google back to the production callback, which hands the sign-in back to the preview (Better Auth's OAuth proxy). This only works once this feature is live in production. |

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

## Adding the secrets

Production (Cloudflare dashboard → Workers & Pages → `movie-watchlist` →
Settings → Variables and Secrets → **Add**, type **Secret**):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

Or from the terminal, one at a time: `pnpm wrangler secret put GOOGLE_CLIENT_SECRET`.

Use the **Secret** type, not plain text. Plain-text variables get replaced by
the `vars` in `wrangler.jsonc` on every deploy, secrets don't. Preview
deployments use the same secrets automatically.

Local dev: add `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` to `.env`.
