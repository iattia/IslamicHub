import { cached } from "@/lib/cache";
import type { Hadith, HadithCollection, HadithResponse } from "@/types/study";

const CDN_BASE =
  "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
const RAW_BASE =
  "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/editions";

export const HADITH_COLLECTIONS: HadithCollection[] = [
  {
    id: "bukhari",
    name: "Sahih al-Bukhari",
    arabicName: "صحيح البخاري",
    compiler: "Imam al-Bukhari",
    count: 7563,
    description:
      "The widely recognized canonical collection of authentic narrations compiled by Imam al-Bukhari.",
  },
  {
    id: "muslim",
    name: "Sahih Muslim",
    arabicName: "صحيح مسلم",
    compiler: "Imam Muslim",
    count: 7563,
    description:
      "A canonical collection of rigorously authenticated narrations compiled by Imam Muslim.",
  },
  {
    id: "abudawud",
    name: "Sunan Abu Dawood",
    arabicName: "سنن أبي داود",
    compiler: "Imam Abu Dawood",
    count: 5274,
    description:
      "A major Sunan collection especially known for narrations concerning legal rulings.",
  },
  {
    id: "tirmidhi",
    name: "Jamiʿ at-Tirmidhi",
    arabicName: "جامع الترمذي",
    compiler: "Imam at-Tirmidhi",
    count: 3956,
    description:
      "A major collection that preserves narrations together with scholarly grading and commentary.",
  },
  {
    id: "nasai",
    name: "Sunan an-Nasa’i",
    arabicName: "سنن النسائي",
    compiler: "Imam an-Nasa’i",
    count: 5758,
    description:
      "One of the six major books, noted for its careful selection and legal arrangement.",
  },
  {
    id: "ibnmajah",
    name: "Sunan Ibn Majah",
    arabicName: "سنن ابن ماجه",
    compiler: "Imam Ibn Majah",
    count: 4341,
    description:
      "One of the six major Hadith collections, organized primarily by legal subject.",
  },
  {
    id: "malik",
    name: "Muwatta Malik",
    arabicName: "موطأ مالك",
    compiler: "Imam Malik",
    count: 1832,
    description:
      "An early collection combining Prophetic narrations with reports and the practice of Madinah.",
  },
  {
    id: "darimi",
    name: "Sunan ad-Darimi",
    arabicName: "سنن الدارمي",
    compiler: "Imam ad-Darimi",
    count: 3406,
    description:
      "An early, respected Sunan arranged across faith, knowledge, worship, and conduct.",
  },
];

type ProviderHadith = {
  hadithnumber: number;
  arabicnumber?: number;
  text: string;
  grades?: Array<{ name?: string; grade?: string } | string>;
  reference?: { book?: number; hadith?: number };
};
type ProviderEdition = { hadiths: ProviderHadith[] };

function collection(id: string) {
  const selected = HADITH_COLLECTIONS.find((item) => item.id === id);
  if (!selected) throw new Error("Unknown Hadith collection");
  return selected;
}

async function provider<T>(path: string, large = false): Promise<T> {
  const options = large
    ? ({ cache: "no-store" } as const)
    : ({ next: { revalidate: 604_800 } } as const);
  const primary = await fetch(`${CDN_BASE}/${path}`, options);
  if (primary.ok) return primary.json() as Promise<T>;
  const fallback = await fetch(`${RAW_BASE}/${path}`, options);
  if (!fallback.ok) throw new Error("Hadith source unavailable");
  return fallback.json() as Promise<T>;
}

const fullEditionMemory = new Map<string, Promise<ProviderEdition>>();
function fullEdition(path: string) {
  const hit = fullEditionMemory.get(path);
  if (hit) return hit;
  while (fullEditionMemory.size >= 2)
    fullEditionMemory.delete(fullEditionMemory.keys().next().value as string);
  const pending = provider<ProviderEdition>(path, true).catch((error) => {
    fullEditionMemory.delete(path);
    throw error;
  });
  fullEditionMemory.set(path, pending);
  return pending;
}

function grades(value: ProviderHadith | undefined): string[] {
  return (value?.grades ?? [])
    .map((grade) =>
      typeof grade === "string"
        ? grade
        : [grade.name, grade.grade].filter(Boolean).join(": "),
    )
    .filter(Boolean);
}

function shape(
  selected: HadithCollection,
  english: ProviderHadith | undefined,
  arabic: ProviderHadith | undefined,
  number: number,
): Hadith | null {
  if (!english && !arabic) return null;
  return {
    id: `${selected.id}:${number}`,
    collectionId: selected.id,
    collectionName: selected.name,
    number,
    book: english?.reference?.book ?? arabic?.reference?.book,
    arabic: arabic?.text ?? "",
    english: english?.text ?? "",
    grades: grades(english),
  };
}

async function getOne(selected: HadithCollection, number: number) {
  return cached(`hadith:${selected.id}:${number}`, 604_800, async () => {
    const [english, arabic] = await Promise.all([
      provider<ProviderEdition>(`eng-${selected.id}/${number}.min.json`).catch(
        () => null,
      ),
      provider<ProviderEdition>(`ara-${selected.id}/${number}.min.json`).catch(
        () => null,
      ),
    ]);
    return shape(selected, english?.hadiths[0], arabic?.hadiths[0], number);
  });
}

function searchText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u064B-\u065F\u0670]/g, "")
    .toLocaleLowerCase();
}

async function search(
  selected: HadithCollection,
  query: string,
  page: number,
  pageSize: number,
): Promise<HadithResponse> {
  const matches = await cached(
    `hadith:search:${selected.id}:${searchText(query)}`,
    3_600,
    async () => {
      const [english, arabic] = await Promise.all([
        fullEdition(`eng-${selected.id}.min.json`),
        fullEdition(`ara-${selected.id}.min.json`),
      ]);
      const arabicByNumber = new Map(
        arabic.hadiths.map((item) => [item.hadithnumber, item]),
      );
      const clean = searchText(query);
      return english.hadiths
        .filter((item) =>
          searchText(
            `${item.text} ${arabicByNumber.get(item.hadithnumber)?.text ?? ""}`,
          ).includes(clean),
        )
        .map((item) =>
          shape(
            selected,
            item,
            arabicByNumber.get(item.hadithnumber),
            item.hadithnumber,
          ),
        )
        .filter((item): item is Hadith => item !== null);
    },
  );
  const offset = (page - 1) * pageSize;
  return {
    collection: selected,
    results: matches.slice(offset, offset + pageSize),
    page,
    pageSize,
    total: matches.length,
    totalPages: Math.max(1, Math.ceil(matches.length / pageSize)),
    query,
  };
}

export async function getHadiths(
  collectionId: string,
  page: number,
  pageSize: number,
  query: string,
): Promise<HadithResponse> {
  const selected = collection(collectionId);
  if (query.trim()) return search(selected, query.trim(), page, pageSize);
  const first = (page - 1) * pageSize + 1;
  const numbers = Array.from(
    { length: Math.min(pageSize, selected.count - first + 1) },
    (_, index) => first + index,
  );
  const results = (
    await Promise.all(numbers.map((number) => getOne(selected, number)))
  ).filter((item): item is Hadith => item !== null);
  return {
    collection: selected,
    results,
    page,
    pageSize,
    total: selected.count,
    totalPages: Math.ceil(selected.count / pageSize),
    query: "",
  };
}
