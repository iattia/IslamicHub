import { cached } from '@/lib/cache';
import type { MushafPage, SearchResult, SurahReader, SurahSummary, Verse } from '@/types/quran';
import { RECITERS, TRANSLATIONS } from '@/types/quran';

const API_BASE = process.env.QURAN_API_BASE ?? 'https://api.alquran.cloud/v1';
type ProviderSurah = { number: number; name: string; englishName: string; englishNameTranslation: string; revelationType: 'Meccan' | 'Medinan'; numberOfAyahs: number; ayahs: ProviderAyah[] };
type ProviderAyah = { number: number; numberInSurah: number; text: string; juz: number; page: number; hizbQuarter: number; audio?: string };
type ProviderResponse<T> = { code: number; status: string; data: T };

async function provider<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, { headers: { accept: 'application/json' }, next: { revalidate: 3600 } });
  if (!response.ok) throw new Error('Quran content is temporarily unavailable.');
  const payload = await response.json() as ProviderResponse<T>;
  if (payload.code !== 200) throw new Error(payload.status || 'Quran content is temporarily unavailable.');
  return payload.data;
}
function summary(surah: ProviderSurah): SurahSummary {
  return { id: surah.number, name: surah.englishName, arabicName: surah.name, meaning: surah.englishNameTranslation, revelationType: surah.revelationType, versesCount: surah.numberOfAyahs };
}
export async function listSurahs(): Promise<SurahSummary[]> {
  return cached('quran:surahs', 86_400, async () => (await provider<ProviderSurah[]>('/surah')).map(summary));
}
export async function getSurah(surahId: number, translationIds = ['en.sahih']): Promise<SurahReader> {
  if (!Number.isInteger(surahId) || surahId < 1 || surahId > 114) throw new Error('Invalid surah number.');
  const allowed = new Set(TRANSLATIONS.map(item => item.id));
  const translations = [...new Set(translationIds.filter(id => allowed.has(id as (typeof TRANSLATIONS)[number]['id'])))];
  const editions = ['quran-uthmani', 'quran-tajweed', ...translations, ...RECITERS.map(item => item.id)].join(',');
  return cached(`quran:surah:${surahId}:${editions}`, 3600, async () => {
    const sources = await provider<ProviderSurah[]>(`/surah/${surahId}/editions/${editions}`);
    const [arabic, tajweed, ...remainder] = sources;
    const translationSources = remainder.slice(0, translations.length);
    const audioSources = remainder.slice(translations.length);
    const verses: Verse[] = arabic.ayahs.map((ayah, index) => ({
      id: ayah.number,
      number: ayah.numberInSurah,
      key: `${surahId}:${ayah.numberInSurah}` as `${number}:${number}`,
      arabic: ayah.text.replace(/^\uFEFF/, ''),
      tajweed: tajweed.ayahs[index]?.text.replace(/^\uFEFF/, '') ?? ayah.text,
      translations: Object.fromEntries(translationSources.map((source, sourceIndex) => [translations[sourceIndex], source.ayahs[index]?.text ?? ''])),
      audio: Object.fromEntries(audioSources.map((source, sourceIndex) => [RECITERS[sourceIndex].id, source.ayahs[index]?.audio ?? null])),
      juz: ayah.juz, page: ayah.page, hizbQuarter: ayah.hizbQuarter,
    }));
    return { ...summary(arabic), verses };
  });
}
export async function getMushafPage(pageNumber: number): Promise<MushafPage> {
  if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > 604) throw new Error('Invalid Mushaf page number.');
  return cached(`quran:mushaf-page:${pageNumber}`, 86_400, async () => {
    const [plain, tajweed] = await Promise.all([
      provider<{ number: number; ayahs: ProviderAyahWithSurah[] }>(`/page/${pageNumber}/quran-uthmani`),
      provider<{ number: number; ayahs: ProviderAyahWithSurah[] }>(`/page/${pageNumber}/quran-tajweed`),
    ]);
    return { number: pageNumber, ayahs: plain.ayahs.map((ayah, index) => ({ id: ayah.number, number: ayah.numberInSurah, key: `${ayah.surah.number}:${ayah.numberInSurah}` as `${number}:${number}`, arabic: ayah.text.replace(/^\uFEFF/, ''), tajweed: tajweed.ayahs[index]?.text.replace(/^\uFEFF/, '') ?? ayah.text, surah: summary(ayah.surah), juz: ayah.juz, page: ayah.page, hizbQuarter: ayah.hizbQuarter })) };
  });
}
type ProviderAyahWithSurah = ProviderAyah & { surah: ProviderSurah };
type ProviderSearch = { matches?: Array<{ numberInSurah: number; text: string; surah: { number: number; englishName: string } }> };
export async function searchQuran(query: string, translationId = 'en.sahih'): Promise<SearchResult[]> {
  const clean = query.trim();
  if (clean.length < 2) return [];
  const selected = TRANSLATIONS.some(item => item.id === translationId) ? translationId : 'en.sahih';
  return cached(`quran:search:${selected}:${clean.toLowerCase()}`, 600, async () => {
    const data = await provider<ProviderSearch>(`/search/${encodeURIComponent(clean)}/all/${selected}`);
    return (data.matches ?? []).slice(0, 30).map(match => ({ key: `${match.surah.number}:${match.numberInSurah}`, surahId: match.surah.number, surahName: match.surah.englishName, verseNumber: match.numberInSurah, text: match.text, translationId: selected }));
  });
}
