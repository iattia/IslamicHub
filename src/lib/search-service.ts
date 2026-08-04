import { searchQuran } from '@/lib/quran-provider';
import type { SearchResult } from '@/types/quran';

type MeiliHit = { surahId: number; surahName: string; verseNumber: number; text: string; translationId: string };
export async function globalSearch(query: string, translation = 'en.sahih'): Promise<SearchResult[]> {
  const host = process.env.MEILISEARCH_HOST?.replace(/\/$/, '');
  if (!host) return searchQuran(query, translation);
  try {
    const response = await fetch(`${host}/indexes/quran_ayahs/search`, { method: 'POST', headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.MEILISEARCH_API_KEY ?? ''}` }, body: JSON.stringify({ q: query, limit: 30, filter: `translationId = "${translation}"` }), cache: 'no-store' });
    if (!response.ok) throw new Error('Search index unavailable.');
    const payload = await response.json() as { hits: MeiliHit[] };
    return payload.hits.map(hit => ({ ...hit, key: `${hit.surahId}:${hit.verseNumber}` }));
  } catch {
    return searchQuran(query, translation);
  }
}
