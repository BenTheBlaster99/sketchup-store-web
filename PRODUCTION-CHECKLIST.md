# SketchLib Frontend — Production Checklist

## Vercel deploy (frontend)

### 1. Push latest code to GitHub

Repo: `BenTheBlaster99/sketchup-store-web` (branch `main`).

### 2. Vercel → New Project → Import repo

- Framework: **Next.js** (auto-detected)
- Root directory: `./` (default)
- Build command: `npm run build`
- Output: default

### 3. Environment variables (Production + Preview)

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_API_URL` | `https://sketchup-store-api-main-cupply.laravel.cloud/api` |
| `NEXT_PUBLIC_PAYMENT_ACCOUNT` | `0799999999999` (placeholder until real BaridiMob #) |

Optional:

| Variable | Value |
|----------|--------|
| `NEXT_PUBLIC_ADMIN_URL` | `https://sketchup-store-api-main-cupply.laravel.cloud/admin` |

(If omitted, admin link is derived from `NEXT_PUBLIC_API_URL`.)

### 4. Deploy → copy your Vercel URL

Example: `https://sketchup-store-web.vercel.app`

### 5. Update Laravel Cloud env (required for CORS)

In **sketchup-store-api** on Laravel Cloud, set:

```
FRONTEND_URL=https://YOUR-VERCEL-URL.vercel.app
SANCTUM_STATEFUL_DOMAINS=YOUR-VERCEL-URL.vercel.app
APP_URL=https://sketchup-store-api-main-cupply.laravel.cloud
```

Redeploy / clear config cache on Laravel Cloud after changing env.

Without `FRONTEND_URL` matching your Vercel origin, the browser will block API calls.

### 6. Smoke test (production)

1. Open Vercel URL → landing loads
2. Register → login
3. `/pricing` → plans load
4. Checkout → submit → pending in Filament
5. Approve in Filament → dashboard full access
6. Download `.skp` from a category with a real R2 model

---

## Auth & security (before real public launch)

- [ ] **Switch from Bearer + js-cookie to Sanctum SPA cookie mode**
  - Tokens in `js-cookie` are readable by JavaScript → XSS can steal sessions.
  - Backend already has `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, CORS credentials.
  - Frontend: remove manual `Authorization` header; use `axios` with `withCredentials: true`.

- [ ] Custom domain: `sketchlib.com` on Vercel + update `FRONTEND_URL` on Laravel Cloud again.

## Build notes

- System fonts (no Google Fonts at build time) — CI/Vercel safe.
- `next.config.ts` has R2 `remotePatterns`; thumbnails use `<Image unoptimized />`.
- `NEXT_PUBLIC_PAYMENT_ACCOUNT` → replace with real BaridiMob number when ready.

## Payments

- Manual payment + Filament approval until BaridiMob integration exists.
- Filament subscriptions list defaults to **Pending** filter — switch to Active to see approved rows.
