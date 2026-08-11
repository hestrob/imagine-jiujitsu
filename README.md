# Imagine Jiu Jitsu — Website

Full site + student portal + admin panel for Imagine Jiu Jitsu (Woodland, CA).
Next.js 14 · Tailwind · SQLite (better-sqlite3) · zero external services needed for local testing.

## Run it locally

```bash
npm install
npm run db:seed   # creates data/imagine.db with demo data
npm run dev       # http://localhost:3000
```

### Demo logins
| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | sean@imaginejj.test    | mat-admin-1 |
| Admin   | admin2@imaginejj.test  | mat-admin-1 |
| Admin   | admin3@imaginejj.test  | mat-admin-1 |
| Student | maya@demo.test         | osss        |
| Student | sam@demo.test          | osss        |

## What's here

- **Public site**: Home, About, Schedule, Pricing ($60/mo single plan), Gallery, Video Wall ("The Wall"), Contact with free-class inquiry form.
- **Student portal** (`/portal`): belt-path progress bar, stripes, months at rank, attendance counts, competition record, membership status.
- **Admin** (`/admin`, 3 seeded accounts): overview stats + revenue estimate, one-tap attendance roll, roster with belt/stripe promotions and competition logging, gallery upload/delete, inquiry inbox, and a Settings page that edits the schedule, video URL, contact info, socials, and coach bio live.
- **Gallery photos**: currently belt-colored SVG placeholders in `public/photos/`. Upload real photos via Admin > Gallery (they save to `public/uploads/`).

## Push to GitHub (backup)

The repo is already initialized with a first commit. Create an empty repo on
github.com (no README), then:

```bash
git remote add origin https://github.com/YOUR_USERNAME/imagine-jiu-jitsu.git
git push -u origin main
```

## Decisions made (Aug 2026)

1. Student accounts with belt/competition/attendance tracking; 3 admins.
2. Single $60/month plan, nothing else.
3. Schedule seeded from the Yelp listing (verify Sunday 6:30–9:00 AM!) — fully editable in Admin > Settings.
4. Brand: "belt line" gradient signature (white→blue→purple→brown→black), gi-indigo + mat-white palette, Anton / Instrument Sans / Space Mono type. Fonts are self-hosted via npm — no Google Fonts dependency.
5. Coach bio is a placeholder marked EDIT ME — editable in Admin > Settings.
6. Video wall = any embed URL (YouTube `/embed/ID` form), swappable in Admin > Settings.
7. Trial-class flow = inquiry form → Admin > Inquiries inbox (email notifications later).
8. Contact phone/email are placeholders — edit in Admin > Settings.
9. Stack: Next.js + SQLite locally. Auth is a built-in session system for now (see roadmap).
10. Domain unknown; site is domain-agnostic.

## Roadmap (not built yet, on purpose)

- **Stripe**: one Product/Price at $60/mo, Checkout on `/join`, webhook →
  `subscriptionStatus`, customer portal link in `/portal`. Link business bank in the Stripe dashboard.
- **Clerk**: swap `src/lib/auth.ts` for Clerk for production
  (current auth is fine for local testing; Clerk adds password reset, MFA, OAuth).
- **Hosting**: Vercel or similar; move SQLite → hosted Postgres at that point
  (`src/lib/db.ts` is the only file that talks to the DB).
- **Uploads in production**: move gallery files from `public/uploads` to S3 / Vercel Blob / UploadThing.
- **SEO**: see SEO-PLAN.md.
