# ինֆո

[Public source on GitHub](https://github.com/arkoc/quietbox) · [Հայերեն AI ստուգման հարցում / review guide](REVIEW.md)

A small, open-source, one-way text-message box for an ordinary browser. Senders write a message, pass the spam check and send; the flow ends at a confirmation with no replies or conversation. The sender page has an anonymous-message heading, a short notice distinguishing application storage from hosting metadata, a message field, spam check and Send button; success is a short confirmation. Privacy details are on `/privacy`, and the GitHub link and AI review prompt are on `/source`. Recipient access is through the separate `/inbox` URL. Senders do not create an account. The recipient signs in to a private inbox. Self-hosted ALTCHA proof-of-work, single-use proofs, a honeypot and shared quotas deter automated spam without IP-based tracking or a third-party CAPTCHA service.

## Privacy promise

The application inbox stores only a random message ID, message text, UTC calendar date and read/unread status. Public requests are reconstructed with an explicit header allowlist before application dispatch. IP/forwarding headers, cookies, authenticated visitor headers, user agents, referrers and platform connection metadata are discarded. Application code does not log request metadata, messages or raw exceptions. Worker observability is disabled in the build configuration.

This is **not a guarantee of untraceability**. The hosting/network provider receives the connection and may process IP addresses and account/session data independently of this application. Its logging, backups and access controls require separate assessment. A recipient who controls the hosting or changes the deployed source could change these protections. Published source is inspectable; it does not prove a deployment is identical or a provider keeps no logs. Text itself may identify its author. No claim of an independent security audit is made.

The hosted submission page is public and does not require a sender account. The separate inbox still requires the recipient's sign-in. Site audience settings and gateway behavior are deployment configuration: verify them on the live site instead of inferring access from this repository. A separately hosted private preview may require site-level sign-in.

## Data and spam protection

- `messages`: `id`, `body`, `day`, `is_read`.
- `used_proofs`: challenge signature and expiry, used to prevent replay. No message ID or sender details.
- `limits`: shared minute/day counters and expiry. No per-person identifiers.
- Limits: 8,000 message characters, 40,000 request bytes, 30 submissions per minute and 500 per UTC day across everyone.
- Challenges expire after five minutes. The database batch atomically consumes a proof, checks quotas and saves the message.
- Messages dated 30 or more days ago and expired proof/counter records are removed on the next accepted submission or recipient inbox refresh. Cleanup is not a scheduled job; idle databases may retain old rows until the next operation. Hosting backups are outside this cleanup.
- The browser stores no message drafts, uses no analytics and sends no form data until Send is pressed. ALTCHA pointer/scroll signatures and time-zone collection are disabled. Challenge and submission fetches use same-origin credentials so the existing site-access cookie can pass a private Sites gateway. Cookies are never sent to an external CAPTCHA service, and the Worker discards cookies and visitor identity headers before application dispatch. Public access does not require a sender account; the host may still receive an existing session cookie. Every application response is marked `no-store`.
- Proof-of-work raises the cost of automated submissions; capable bots can still solve it. Shared quotas can also be exhausted by an attacker. Do not advertise it as stopping every bot or as a high-risk whistleblower platform.

## Run locally

Use Node 22.13+ for the app; tests use Node's built-in `node:sqlite` (Node 22.13+). Install with `npm run install:ci`. Create ignored `.dev.vars` using `.env.example` as the key guide. Generate a random `BOT_SECRET` (at least 32 bytes). For local preview only set `RECIPIENT_EMAIL=seedy@sites.test`, the starter's mock sign-in identity.

```sh
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_glossy_valkyrie.sql
npm run dev -- --port 5188 --hostname 127.0.0.1
```

Open `http://127.0.0.1:5188/`; `/inbox` provides local mock sign-in. Never expose the development server to the internet. Local mock authentication is not production authentication.

## Production

This project uses the Sites Vinext/Cloudflare Workers starter and D1. Sites applies `drizzle` migrations during deployment and supplies the authenticated recipient headers through its trusted sign-in gateway. Configure `BOT_SECRET` and `RECIPIENT_EMAIL` in the host's secret store. Missing configuration fails closed. Set the recipient email to the owner's actual sign-in email. Do not use the owner credentials or email for senders.

The inbox trusts Sites-injected `oai-authenticated-user-id` and `oai-authenticated-user-email`. **Do not expose this Worker through a route that accepts those headers from the public.** A different host needs its own server-validated recipient authentication and must strip spoofed identity headers. The development mock must never run in production.

For an independent copy, remove the original `project_id` from `.openai/hosting.json` and register your own Site. Publishing source or configuration never includes `.dev.vars`, runtime secrets, database state or credentials. Keep dependencies locked and review updates.

## Review with an AI

Give an AI the [repository link](https://github.com/arkoc/quietbox) and the ready-to-copy Armenian prompt in [REVIEW.md](REVIEW.md). Ask it to inspect implementation files and cite the commit it reviewed, not merely repeat privacy claims. AI output can be wrong; it is not an independent security audit and cannot certify the live deployment or hosting logs from source alone.

## Verify

```sh
npm test
npx tsc --noEmit
npm run source:bundle
npm run build
```

Tests exercise header removal, bounded input, real ALTCHA proof verification, tampered/expired proof rejection, atomic replay protection, shared quotas, stored fields and retention against the actual migration. Also verify the deployed gateway rejects unauthenticated inbox requests and spoofed identity headers.

`/source` displays the application's source and per-file SHA-256 hashes. `/quietbox-source.tar.gz` includes the complete allowlisted source, dependency lockfile and tests. Run `npm run source:bundle` after source edits and before building. The bundle excludes runtime data and secrets. Hashes are aids to comparing files, not independent deployment attestation.

## Main files

- `app/components/message-form.tsx`: browser form and local spam check.
- `build/sites-worker.ts`, `lib/privacy.ts`: request sanitization and response headers.
- `lib/submissions.ts`: validation, proof verification, quotas and persistence.
- `app/api/inbox/route.ts`, `lib/recipient.ts`: recipient authorization and inbox actions.
- `db/schema.ts`, `drizzle/`: exact storage schema.

MIT licensed. ALTCHA and framework dependencies retain their own licenses.
