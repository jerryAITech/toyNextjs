# ToyStore

A full-stack toy e-commerce platform — customer storefront (mobile-app-like on phones) plus a
separate admin panel — built with Next.js App Router, TypeScript, Tailwind CSS, MongoDB/Mongoose,
and Razorpay + Cash on Delivery payments.

## Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4
- **Backend**: Next.js Route Handlers (`src/app/api/**`) behind a `src/lib/services/*` layer, MongoDB via Mongoose
- **Auth**: custom JWT (httpOnly cookie) + bcrypt, edge middleware (`src/proxy.ts`) for route protection
- **Payments**: Razorpay (test mode) + Cash on Delivery
- **Media**: local disk uploads (`public/uploads/**`) via `/api/upload`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in the values (MongoDB URI, a random `JWT_SECRET`,
   Razorpay keys). `RAZORPAY_KEY_SECRET` is required for real Razorpay payment verification — COD
   works without it.
3. Seed the database with demo data — 12 categories, 60 products (5 per category), users, orders,
   coupons, banners and reviews. This downloads and verifies a real photo for every product/category/
   banner image (see "Seed images" below), so it takes a few minutes:
   ```bash
   npm run seed
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```
   App: http://localhost:3000 · Admin: http://localhost:3000/admin/login

## Deploying to Vercel

Vercel is a verified deployment target for this Next.js version (App Router, Server Actions,
Route Handlers, edge middleware all work out of the box) — no code changes are required for the
framework itself. Two things in this app *do* need attention before going live, both already
called out in "Known limitations" below:

1. **Use a reachable MongoDB, not `localhost`.** Vercel's servers can't reach a database on your
   machine. Create a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or any
   MongoDB host reachable from the internet), allow network access from anywhere (`0.0.0.0/0`, or
   Vercel's IP ranges), and use that connection string for `MONGODB_URI`. The app's Mongoose
   connection (`src/lib/db/connect.ts`) already caches the client across invocations, which is
   what's required for serverless/edge functions — no changes needed there.
2. **Media uploads won't persist.** `/api/upload` currently writes to `public/uploads/**` on local
   disk (`src/lib/utils/upload.ts`). Vercel's filesystem is read-only at runtime and ephemeral
   between deploys, so admin-uploaded product/category/banner images will fail to save (or vanish
   on the next deploy). Swap `src/lib/utils/upload.ts` for a real object store (S3, Cloudinary,
   Vercel Blob, etc.) before relying on the admin image upload in production. Seed data is
   unaffected since it links to external image URLs, not local files.

### Steps

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In the [Vercel dashboard](https://vercel.com/new), import the repo — Next.js is auto-detected,
   so the default build command (`next build`) and output settings need no changes.
3. Add the environment variables from `.env.example` under Project Settings → Environment
   Variables (set them for Production, and Preview if you want preview deployments to work too):
   - `MONGODB_URI` — your Atlas (or other hosted) connection string
   - `JWT_SECRET` — a long random string
   - `COOKIE_NAME` — optional, defaults are fine
   - `RAZORPAY_KEY_ID` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` — your Razorpay key id (safe to expose)
   - `RAZORPAY_KEY_SECRET` — your Razorpay secret (leave unset to disable online payments and
     fall back to COD only)
   - `NEXT_PUBLIC_SITE_URL` — your production URL, e.g. `https://your-app.vercel.app`
4. Deploy. Vercel builds with `npm run build` and serves with its own runtime (you don't need
   `npm run start` — that's only for self-hosting).
5. Seed the production database once, from your local machine, by pointing `MONGODB_URI` in
   `.env.local` at the production database and running `npm run seed` — there's no persistent
   shell on Vercel to run it there.

Alternatively, use the [Vercel CLI](https://vercel.com/docs/cli): `npx vercel` for a preview
deploy, `npx vercel --prod` to ship to production, after running `npx vercel env pull .env.local`
or setting env vars with `npx vercel env add`.

## Seeded logins

| Role     | Email                  | Password       |
| -------- | ----------------------- | -------------- |
| Admin    | admin@toystore.dev       | Admin@12345    |
| Customer | aarav@example.com        | Customer@123   |
| Customer | diya@example.com         | Customer@123   |
| Customer | rohan@example.com        | Customer@123   |
| Customer | ananya@example.com       | Customer@123   |

(Emails/password can be changed via `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` in `.env.local`
before re-running `npm run seed`.)

## Known limitations

These were explicit, deliberate scope cuts (see the original build plan) — not oversights:

- **Password reset email**: no SMTP/email provider is configured. `POST /api/auth/forgot-password`
  logs the reset link server-side and returns it in the API response in non-production, so the
  forgot-password flow is fully testable without a real inbox. Wire up a provider (Resend,
  SendGrid, etc.) in `src/lib/services/authService.ts` (`requestPasswordReset`) for production.
- **Media storage**: product/category/banner uploads are saved to local disk
  (`public/uploads/**`), not a CDN. Fine for a single instance; swap `src/lib/utils/upload.ts` for
  S3/Cloudinary before deploying to a platform with an ephemeral filesystem (e.g. Vercel).
- **Razorpay**: `RAZORPAY_KEY_ID` is public and safe to ship; `RAZORPAY_KEY_SECRET` must be set for
  order creation/signature verification to work. Without it, Razorpay checkout fails gracefully
  with "Online payment is temporarily unavailable" and COD still works end-to-end.
- **Rate limiting**: an in-memory sliding-window limiter on auth/checkout endpoints — correct for a
  single dev/small instance, not distributed-safe across multiple server instances.
- **Legal/info pages** (privacy, terms, shipping, return, refund, cancellation, FAQ, about,
  contact): real, complete, ToyStore-specific content, but generic boilerplate rather than
  lawyer-reviewed legal text.
- **Seed images**: product/category/banner photos are real stock photos pulled by keyword from
  LoremFlickr (e.g. "teddybear", "toy,car") rather than actual product photography, so the demo
  doesn't depend on sourcing real toy shoots. `scripts/seed.ts`'s `resolveImage()` downloads and
  hashes each candidate photo and skips ahead to a different one whenever it collides with an
  image already used elsewhere in the run, so no two products ever end up with the same picture.
  Most images are genuinely on-topic; a few land on a plausible-but-not-exact photo for their tag —
  swap the `imgTag` field on the relevant entry in `scripts/seed.ts` and re-run `npm run seed` to
  pick a different one. Replace with real product photography via the admin product image upload
  before using this for anything beyond a demo.

## Project structure

```
src/
  app/
    (site)/        customer storefront route group (shared header/footer/bottom-nav)
    admin/          admin panel — admin/login is standalone, admin/(protected)/** has the sidebar layout
    api/            REST API route handlers
  components/
    ui/             design-system primitives (Button, Input, Modal, Table, ...)
    site/           storefront-specific components
    admin/          admin-panel-specific components
  lib/
    models/         Mongoose schemas
    services/       business logic (Route Handler → Service → Model)
    validation/      zod schemas
    auth/, razorpay/, utils/
  context/          client-side React context (Auth, Cart, Wishlist, Toast)
scripts/seed.ts     database seed script
```

## Scripts

- `./run.sh` — convenience launcher: installs deps if missing, checks `.env.local` is filled in,
  then starts the dev server. `./run.sh --seed` reseeds the database first; `./run.sh --build`
  does a production build + start instead of the dev server.
- `npm run dev` — start the dev server
- `npm run build` / `npm run start` — production build/serve
- `npm run seed` — wipe and reseed the database with demo data
- `npm run lint` — ESLint
