# API contract

All JSON responses use `{ "data": ... }` on success and `{ "error": "..." }` on failure. Mutations require an Auth.js session and only act on the current user.

## Public reader and search

| Method | Endpoint                                                         | Purpose                                                                  |
| ------ | ---------------------------------------------------------------- | ------------------------------------------------------------------------ |
| GET    | `/api/reader/surahs`                                             | List all surahs; CDN cacheable                                           |
| GET    | `/api/reader/surahs/:surahId?translations=en.sahih,en.pickthall` | Canonical reader payload including ayahs, translations, and reciter URLs |
| GET    | `/api/search?q=mercy&translation=en.sahih`                       | Global Quran search with canonical verse keys                            |
| GET    | `/api/audio/:reciter/:ayahId`                                    | Planned signed or redirect audio endpoint when objects move to S3        |

Reader request validation: `surahId` must be 1–114 and translation IDs are allow-listed. Search is 2–100 characters and its query is encoded server-side.

## Authenticated study APIs

| Method          | Endpoint                | Purpose                                                              |
| --------------- | ----------------------- | -------------------------------------------------------------------- |
| GET/POST/DELETE | `/api/me/bookmarks`     | List, save/update, or delete a bookmark by ayah ID                   |
| GET/POST        | `/api/me/notes`         | List and create notes                                                |
| PATCH/DELETE    | `/api/me/notes/:noteId` | Update or delete an owned note                                       |
| GET/POST        | `/api/me/collections`   | List and create collections                                          |
| GET/PATCH       | `/api/me/preferences`   | Read and sync reader preferences and versioned Study workspace state |
| POST            | `/api/me/history`       | Planned debounced reading/listening telemetry                        |
| GET/POST/PATCH  | `/api/me/goals`         | Planned reading-goal lifecycle                                       |

### Bookmark example

```http
POST /api/me/bookmarks
Content-Type: application/json

{ "ayahId": 262, "folder": "Morning reflection", "tags": ["mercy"] }
```

The database enforces one bookmark per user/ayah. Every handler derives the user only from the server session and scopes reads/writes by `userId`.

## Public Study workspace APIs

| Method | Endpoint                                                                            | Purpose                                                                        |
| ------ | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| GET    | `/api/study/hadith/collections`                                                     | List the supported major Hadith collections                                    |
| GET    | `/api/study/hadith?collection=bukhari&page=1&pageSize=8&q=intentions`               | Browse or search paired Arabic/English narrations                              |
| GET    | `/api/study/prayer-times?lat=40.7128&lng=-74.006&method=2&school=0&date=2026-08-01` | Get daily timings, Hijri date, timezone, calculation method, and Qibla bearing |

Hadith browsing is paginated but does not impose an artificial final page. Search runs across the selected complete collection. Public source responses use server and CDN caching; personal bookmarks, Azkaar counts, and prayer preferences use local-first storage and authenticated preference synchronization.
