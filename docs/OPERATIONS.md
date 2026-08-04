# Operations, testing, and launch

## Deployment plan

1. Build the Docker image with the included multi-stage `Dockerfile` and run it on Vercel, ECS, Cloud Run, or Kubernetes.
2. Use managed PostgreSQL with encrypted backups, Redis with TLS, managed Meilisearch, and S3/CDN for licensed audio/downloads.
3. Put Cloudflare or the hosting CDN in front of public reader/search endpoints. Cache public surah payloads; never cache `/api/me/*` publicly.
4. Run Prisma migrations as a one-off deploy step, then run a content ingest/indexing job through a queue.
5. Use environment-scoped secrets from the deployment platform; no credentials are committed.

## Test strategy

- Unit: Zod input validation, content mappings, cache behavior, playback state machine, and ownership guards (Vitest).
- Integration: route handlers against disposable Postgres/Redis, Auth.js session fixtures, and provider-response fixtures (no network in CI).
- E2E: Playwright tests for keyboard reader navigation, high contrast, signup, notes/bookmarks sync, multi-translation layout, audio state, and offline recovery.
- Performance: k6 scenarios for cached reader payloads, search p95, login/session refresh, and rate limiting.
- Accessibility: axe in CI plus manual screen-reader and keyboard acceptance tests on desktop/mobile.

## Security checklist

- [ ] Auth.js secret and OAuth redirect URIs configured per environment.
- [ ] HttpOnly, Secure, SameSite session cookies and HTTPS-only origin.
- [ ] Zod validation for every route; body size limits and explicit error responses.
- [ ] Ownership filters on every user-scoped read/mutation.
- [ ] CSP, HSTS, frame-ancestors, Referrer-Policy, and Permissions-Policy headers.
- [ ] Redis-backed rate limits for search, auth, and mutation routes.
- [ ] Audit S3 bucket policy; signed URLs only for protected/licensed objects.
- [ ] Escape notes on display; use a reviewed sanitizer if rich text is introduced.
- [ ] Dependency/secret scanning, SAST, DB backups, and restore drills.
- [ ] Verify Quran content provenance, edition, audio, and translation licenses before release.

## Performance checklist

- [ ] SSR shell + streaming boundaries for reader/dashboard.
- [ ] Redis/CDN cache tags for immutable Quran data.
- [ ] Virtualized ayah list for long surahs and lazy study-panel import.
- [ ] Prefetch adjacent surahs after reader idle.
- [ ] Responsive audio/image formats and CDN cache controls.
- [ ] Meilisearch typo tolerance, Arabic normalization, and bounded result windows.
- [ ] Brotli compression, edge routing for public content, and real-user Web Vitals.
- [ ] PWA cache quota monitoring; only cache chapters the user explicitly opens.

## Production launch checklist

- [ ] Content ingest reconciles 114 surahs / 6,236 ayahs and validates checksums.
- [ ] Legal approves all translations, recitations, audio downloads, and attribution.
- [ ] Migration, seed, rollback, backup, and restore tested in staging.
- [ ] OAuth, email, privacy policy, terms, account deletion, and data export flows live.
- [ ] Search index parity and reindex job tested.
- [ ] Load, accessibility, mobile browser, offline, and assisted-technology signoff.
- [ ] Alerts for API error rate, provider fallback, queue lag, DB/Redis saturation, and synthetic reader checks.
- [ ] Error tracking, structured logs with PII redaction, analytics consent, and incident runbook live.
