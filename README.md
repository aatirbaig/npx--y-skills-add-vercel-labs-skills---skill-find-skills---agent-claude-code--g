# FoundersBee

A startup-perks marketplace: verified credits, grants and software discounts for founders,
free to browse, with the negotiated codes behind a membership.

Built with Next.js 16 (App Router) · TypeScript · Tailwind v4 · Auth.js v5 · Drizzle + libSQL ·
Stripe.

## Quick start

```bash
pnpm install
cp .env.example .env.local          # then set AUTH_SECRET: openssl rand -base64 32
pnpm db:push                        # creates .data/foundersbee.db
pnpm dev
```

The catalog is content-as-code, so the site browses fine with an empty `.env.local` — only
sign-in, checkout and the dashboard need configuration.

| Command | What it does |
| --- | --- |
| `pnpm dev` | Dev server on :3000 |
| `pnpm build` | Production build — fails if any deal file is invalid |
| `pnpm test` | Vitest: content schema + the gating leak tests |
| `pnpm test:e2e` | Playwright: anonymous → member walkthrough |
| `pnpm typecheck` / `pnpm lint` | tsc and ESLint |
| `pnpm db:push` | Apply the Drizzle schema to the database |

## How it fits together

```
content/deals/*.md      the catalog — one Markdown file per program, Zod-validated
content/categories.ts   taxonomy; collections.ts defines curated bundles as predicates
lib/content/            schema, loader, and redact.ts (the gating choke point)
lib/db/                 Drizzle schema + libSQL client (users, sessions, saves, claims)
lib/auth.ts             Auth.js v5, magic link
lib/stripe/             plans, client, and the pure membership rules
app/                    routes; see the route table in `pnpm build` output
```

**Deals live in git, users live in a database.** The catalog needs no CMS, no seed script and no
migration to edit — open the Markdown file, change it, and the build validates it. Only
user-side state (accounts, saved deals, claims, membership) touches SQL.

**libSQL runs the same dialect in both places**: a local file in development, Turso in
production. One schema, one set of migrations.

## The gating rule

Premium deals are **visible but locked**. The vendor, name, headline value, eligibility rules and
long-form copy are public — that is what ranks in search, and an anonymous visitor sees exactly
what Googlebot sees. The redemption payload and the step-by-step claim instructions are stripped
**on the server** for anyone who has not earned them.

`lib/content/redact.ts` exports `publicDeal(deal, viewer)` and it is the only path from the
catalog to a rendered page. Nothing serializes a raw `Deal`. This means the code and the claim
steps are absent from the HTML and from the React flight data — there is nothing to un-blur in
devtools.

Three tests hold that line:

- `tests/content.test.ts` asserts no premium deal's code, partner link or claim steps survive
  `JSON.stringify(publicDeal(deal, null))`, and that list cards never carry a redemption at all.
- The same file asserts the public Markdown body never restates a gated claim step.
- `e2e/foundersbee.spec.ts` fetches a premium deal page anonymously and asserts the response HTML
  does not contain the claim step or the placeholder.

## Redemption codes are never in git

This repository is public and the codes are the paid product, so `content/deals/*.md` carries the
placeholder `__ENV__`. Real values are injected at runtime from `REDEMPTIONS_JSON`, keyed by slug:

```json
{ "notion-for-startups": { "code": "REALCODE", "url": "https://..." } }
```

An unresolved placeholder is never presented as a working code — the page shows the claim steps
and the official link instead.

## Adding a deal

Create `content/deals/<slug>.md`. The filename must match the `slug` field. Frontmatter is
validated by `dealFrontmatterSchema` in `lib/content/schema.ts`; anything invalid fails the build
with the file and field named. The Markdown body is public, so keep gated claim steps out of it —
they belong in the `howToClaim` frontmatter array.

Set `unverifiedSeed: true` until someone has opened the vendor's page and confirmed the terms.
The listing then says "pending re-check" instead of claiming a verification that has not happened.

## Payments

Stripe is the source of truth for entitlement; the `membership` column is a cache written by the
webhook. `lib/stripe/membership.ts` holds the rules as a pure function — a lifetime purchase is
terminal and no subscription event can revoke it, and `past_due` keeps access while Stripe retries.

To exercise the webhook locally:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
# then buy the annual plan with 4242 4242 4242 4242
```

## Deployment

Set `NEXT_PUBLIC_SITE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, `DATABASE_URL` +
`DATABASE_AUTH_TOKEN` (Turso), the four `STRIPE_*` values and `REDEMPTIONS_JSON`. Run
`pnpm db:push` against the production database once, then deploy.

**Anywhere but Vercel, also set `AUTH_TRUST_HOST=true`** (or pin `AUTH_URL` to the exact
origin). Auth.js infers a trusted host on Vercel and in development, and rejects everything
else as `UntrustedHost` — which surfaces as sign-in that appears to work but never sends.

Most routes prerender; only deal pages, the dashboard, login and the API routes are dynamic. Keep
it that way — a session read in `app/layout.tsx` would opt the entire site out of static
rendering, which is why the header's account link is a client component.

## Known gaps before launch

- **The seed catalog needs re-verification.** All 25 programs were written from public vendor
  documentation without opening the live pages, so every one is flagged `unverifiedSeed: true`.
  Confirm each against its `sourceUrl`, then set the flag to `false` and update `verifiedAt`.
- **`/terms` and `/privacy` are drafts.** They describe what the software actually does, which
  makes them an honest starting point and not a substitute for legal review.
- The Stripe webhook has been unit-tested but not run against a live Stripe account.
