# IslamicHub

IslamicHub is an original Quran and Islamic study platform built with Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Redis, Auth.js, and Meilisearch-compatible search. It includes Quran reading and audio, major Hadith collections, daily Azkaar, prayer times, Hijri date, and Qibla utilities.

## Quick start

1. Copy `.env.example` to `.env.local` and set `AUTH_SECRET`.
2. Start infrastructure: `docker compose up -d postgres redis meilisearch`.
3. Install and initialize: `npm install && npm run db:generate && npm run db:migrate`.
4. Start: `npm run dev`.

Open `http://localhost:3000`. The Quran reader and search use the configured public content provider; authenticated notes, bookmarks, collections, preferences, and history require PostgreSQL.

## Documentation

- [Platform architecture and design system](docs/PLATFORM.md)
- [API contract](docs/API.md)
- [Operations, security, testing, and launch](docs/OPERATIONS.md)
- [Phased delivery roadmap](docs/ROADMAP.md)
- [Study data sources and personal-cache policy](docs/STUDY_SOURCES.md)

## Verification

```bash
npm run db:generate
npm run typecheck
npm run build
npm test
```

Content must be seeded or licensed in accordance with the provider and translation terms before public launch. See the attribution and source policy in the operations guide.
