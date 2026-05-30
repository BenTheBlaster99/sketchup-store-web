# SketchLib Frontend — Production Checklist

Use this before deploying sketchup-store-web to production.

## Auth & security (required)

- [ ] **Switch from Bearer + js-cookie to Sanctum SPA cookie mode**
  - Tokens in `js-cookie` are readable by JavaScript → XSS can steal sessions.
  - Backend already has `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, CORS credentials.
  - Frontend: remove manual `Authorization` header; use `axios` with `withCredentials: true`.
  - See Laravel Sanctum SPA authentication docs.

- [ ] Set production `NEXT_PUBLIC_API_URL` to your real API domain (HTTPS).
- [ ] Ensure API `APP_URL`, `FRONTEND_URL`, and CORS allow only your real domains.

## Build & deploy

- [ ] **Fonts**: Google Fonts removed — app uses system fonts (CI-safe `npm run build`).
- [ ] **Images**: `next.config.ts` includes R2 `remotePatterns`; thumbnails use `<Image unoptimized />` because presigned URLs expire.
- [ ] Run `npm run build` in CI before deploy.
- [ ] Set `NEXT_PUBLIC_PAYMENT_ACCOUNT` to real BaridiMob/CCP number when ready.

## Payments

- [ ] Manual payment flow requires Filament admin to approve subscriptions/packs.
- [ ] Train admin user on Filament Pending filters (default shows pending only).

## Optional hardening

- [ ] Error boundaries on dashboard/checkout routes
- [ ] E2E smoke tests (login → browse → download)
- [ ] Rate limiting / bot protection on auth routes (API side)
