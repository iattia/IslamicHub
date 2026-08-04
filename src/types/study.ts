export type StudyState = {
  version: 1;
  updatedAt: string;
  savedHadiths: string[];
  recentHadiths: string[];
  azkar: { date: string; counts: Record<string, number> };
  prayer: {
    latitude?: number;
    longitude?: number;
    label?: string;
    method: number;
    school: 0 | 1;
  };
};

export type HadithCollection = {
  id: string;
  name: string;
  arabicName: string;
  compiler: string;
  count: number;
  description: string;
};

export type Hadith = {
  id: string;
  collectionId: string;
  collectionName: string;
  number: number;
  book?: number;
  arabic: string;
  english: string;
  grades: string[];
};

export type HadithResponse = {
  collection: HadithCollection;
  results: Hadith[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  query: string;
};

export type AzkarCategory = {
  id: string;
  title: string;
  arabicTitle: string;
  description: string;
  items: AzkarItem[];
};

export type AzkarItem = {
  id: string;
  arabic: string;
  transliteration: string;
  translation: string;
  repetitions: number;
  reference: string;
};

export type PrayerTimes = {
  date: { readable: string; hijri: string; weekday: string };
  timings: Record<
    "Fajr" | "Sunrise" | "Dhuhr" | "Asr" | "Maghrib" | "Isha",
    string
  >;
  method: { id: number; name: string };
  timezone: string;
  qibla: number;
};
