export type SurahSummary = { id: number; name: string; arabicName: string; meaning: string; revelationType: 'Meccan' | 'Medinan'; versesCount: number };
export type Verse = { id: number; number: number; key: `${number}:${number}`; arabic: string; tajweed: string; translations: Record<string, string>; audio: Record<string, string | null>; juz: number; page: number; hizbQuarter: number };
export type SurahReader = SurahSummary & { verses: Verse[] };
export type MushafAyah = { id: number; number: number; key: `${number}:${number}`; arabic: string; tajweed: string; surah: SurahSummary; juz: number; page: number; hizbQuarter: number };
export type MushafPage = { number: number; ayahs: MushafAyah[] };
export type SearchResult = { key: string; surahId: number; surahName: string; verseNumber: number; text: string; translationId: string };
export const TRANSLATIONS = [
  { id: 'en.sahih', label: 'Sahih International', language: 'English' },
  { id: 'en.pickthall', label: 'Pickthall', language: 'English' },
  { id: 'en.yusufali', label: 'Yusuf Ali', language: 'English' },
] as const;
export const RECITERS = [{ id: 'ar.alafasy', label: 'Mishary Rashid Alafasy' }] as const;
