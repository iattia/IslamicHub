# Development roadmap

## Phase 1 — foundation (implemented)

- Next.js 15 App Router, TypeScript, Tailwind design system, original responsive shell, themes, metadata, sitemap, robots, PWA registration.
- Prisma normalized schema, Auth.js boundary, Redis-capable cache, Docker and local service topology.
- Live chapter list/reader/search routes, multi-translation reader, continuous verse audio, repeat verse, font/spacing/width controls, local guest saves.
- Authenticated API foundations for bookmarks, notes, collections, and preferences.

## Phase 2 — durable study workspace

- Content ingestion + outbox-driven Meilisearch index; full Arabic and topic search filters.
- Authenticated bookmark folders/tags, highlights with exact word ranges, markdown notes, collection items, import/export, and account deletion/export.
- Progress/history routes and dashboard widgets backed by PostgreSQL.
- Juz, hizb, and page navigation after corpus seed, plus robust virtual scrolling.

## Phase 3 — study and listening depth

- Verified tajweed annotations, word-by-word glosses, root/morphology/grammar data, tafsir/cross-reference provider adapters.
- Multiple reciters, speed, repeat range, sleep timer, Media Session integration, background behavior, and entitlement-aware downloads.
- Goals, streaks, private reminders, personalized home feed, and sync conflict resolution.

## Phase 4 — scale and release

- S3 audio/object pipeline, queue workers, Meilisearch synonyms/ranking, Redis rate limits, observability, and autoscaling.
- E2E/load/a11y test gates, localization, usability studies, disaster recovery, privacy review, and staged rollout.

Each phase is released only after its schema migration, API contract, tests, accessibility review, and operations runbook are complete.
