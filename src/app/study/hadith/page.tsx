"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bookmark,
  BookOpenText,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { useContentLanguage } from "@/components/content-language-provider";
import { StorageStatus } from "@/components/study/storage-status";
import { Button } from "@/components/ui/button";
import { useStudyState } from "@/lib/use-study-state";
import { cn } from "@/lib/utils";
import type { HadithCollection, HadithResponse } from "@/types/study";

async function getData<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok)
    throw new Error((await response.json()).error ?? "Hadith data unavailable");
  return (await response.json()).data as T;
}

export default function HadithPage() {
  const [collection, setCollection] = useState("bukhari");
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const { language, showTranslation } = useContentLanguage();
  const showArabicContent = language === "ar" || showTranslation;
  const showEnglishContent = language === "en" || showTranslation;
  const bilingual = showArabicContent && showEnglishContent;
  const { state, update, storage } = useStudyState();
  const collections = useQuery({
    queryKey: ["hadith-collections"],
    queryFn: () => getData<HadithCollection[]>("/api/study/hadith/collections"),
    staleTime: 86_400_000,
  });
  const hadiths = useQuery({
    queryKey: ["hadith", collection, query, page],
    queryFn: () =>
      getData<HadithResponse>(
        `/api/study/hadith?collection=${collection}&page=${page}&pageSize=8&q=${encodeURIComponent(query)}`,
      ),
    placeholderData: (previous) => previous,
  });
  const selectedCollection = collections.data?.find(
    (item) => item.id === collection,
  );

  function search(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setQuery(draft.trim());
  }

  function toggleSaved(id: string) {
    update((current) => ({
      ...current,
      savedHadiths: current.savedHadiths.includes(id)
        ? current.savedHadiths.filter((item) => item !== id)
        : [id, ...current.savedHadiths],
      recentHadiths: [
        id,
        ...current.recentHadiths.filter((item) => item !== id),
      ].slice(0, 50),
    }));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex justify-end">
        <StorageStatus storage={storage} />
      </div>
      <header
        className="mt-10 max-w-3xl"
        lang={language}
        dir={language === "ar" ? "rtl" : "ltr"}
      >
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-accent">
          {language === "ar" ? "مكتبة الحديث" : "Hadith library"}
        </p>
        <h1
          className={cn(
            "mt-2 text-4xl font-semibold tracking-tight sm:text-5xl",
            language === "ar" && "arabic leading-[1.7] tracking-normal",
          )}
        >
          {language === "ar"
            ? "المصادر الموثوقة، متاحة للقراءة المتأنية."
            : "Trusted collections, open for careful reading."}
        </h1>
        <p className="mt-4 leading-7 text-muted">
          {language === "ar"
            ? "تصفّح نصوص الأحاديث كاملة من أمهات الكتب باللغة التي اخترتها. تُنظّم الصفحات عرض المكتبة من دون تقييد الوصول."
            : "Browse complete narrations from the major collections in your chosen reading language. Pagination organizes the library without limiting access."}
        </p>
      </header>

      <section className="mt-8 rounded-3xl border border-line bg-panel p-4 sm:p-5">
        <form
          onSubmit={search}
          className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px_auto]"
        >
          <label className="relative">
            <span className="sr-only">Search narrations</span>
            <Search className="pointer-events-none absolute left-3 top-3 size-4 text-muted" />
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                language === "ar" ? "ابحث في نص الحديث" : "Search Hadith text"
              }
              className="h-10 w-full rounded-xl border border-line bg-canvas pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-accent"
            />
          </label>
          <label>
            <span className="sr-only">Hadith collection</span>
            <select
              value={collection}
              onChange={(event) => {
                setCollection(event.target.value);
                setPage(1);
              }}
              className="h-10 w-full rounded-xl border border-line bg-canvas px-3 text-sm outline-none focus:ring-2 focus:ring-accent"
            >
              {collections.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {language === "ar" ? item.arabicName : item.name}
                </option>
              ))}
            </select>
          </label>
          <Button size="sm" className="h-10">
            <Search className="size-4" /> Search
          </Button>
        </form>
        {query && (
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted">
            <span>
              {hadiths.data
                ? `${hadiths.data.total.toLocaleString()} matches for “${query}”`
                : "Searching the complete collection…"}
            </span>
            <button
              type="button"
              className="hover:text-ink"
              onClick={() => {
                setDraft("");
                setQuery("");
                setPage(1);
              }}
            >
              Clear search
            </button>
          </div>
        )}
      </section>

      {hadiths.isLoading && (
        <div className="mt-6 grid gap-4">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-64 animate-pulse rounded-3xl border border-line bg-panel"
            />
          ))}
        </div>
      )}
      {hadiths.isError && (
        <div
          role="alert"
          className="mt-6 rounded-3xl border border-line bg-panel p-8"
        >
          <h2 className="font-semibold">The collection could not be loaded.</h2>
          <p className="mt-2 text-sm text-muted">
            Check your connection and try again. Previously loaded pages remain
            available through the browser cache.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => hadiths.refetch()}
          >
            Try again
          </Button>
        </div>
      )}
      {hadiths.data && (
        <>
          <div className="mt-6 space-y-4">
            {hadiths.data.results.map((hadith) => {
              const saved = state.savedHadiths.includes(hadith.id);
              return (
                <article
                  key={hadith.id}
                  className="rounded-3xl border border-line bg-panel p-5 sm:p-8"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-muted">
                      <BookOpenText className="size-4 text-accent" />
                      <span
                        lang={language}
                        dir={language === "ar" ? "rtl" : "ltr"}
                      >
                        {language === "ar"
                          ? `${selectedCollection?.arabicName ?? hadith.collectionName} · حديث ${hadith.number.toLocaleString("ar-EG")}`
                          : `${hadith.collectionName} · Hadith ${hadith.number}`}
                      </span>
                      {hadith.book && (
                        <span>
                          · {language === "ar" ? "كتاب" : "Book"} {hadith.book}
                        </span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant={saved ? "primary" : "ghost"}
                      onClick={() => toggleSaved(hadith.id)}
                      aria-pressed={saved}
                    >
                      <Bookmark className="size-4" /> {saved ? "Saved" : "Save"}
                    </Button>
                  </div>
                  {showArabicContent && hadith.arabic && (
                    <p
                      lang="ar"
                      dir="rtl"
                      className="arabic-prose mt-7 text-right text-[1.75rem] sm:text-[2rem]"
                    >
                      {hadith.arabic}
                    </p>
                  )}
                  {showEnglishContent && hadith.english && (
                    <p
                      className={cn(
                        "text-[17px] leading-8 text-ink/80",
                        bilingual
                          ? "mt-5 border-t border-line pt-5 text-muted"
                          : "mt-7",
                      )}
                    >
                      {hadith.english}
                    </p>
                  )}
                  {showEnglishContent && hadith.grades.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {hadith.grades.map((grade) => (
                        <span
                          key={grade}
                          className="rounded-full bg-sand px-2.5 py-1 text-[11px] text-accent"
                        >
                          {grade}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
            {hadiths.data.results.length === 0 && (
              <div className="rounded-3xl border border-dashed border-line p-10 text-center text-muted">
                No narrations matched that search in this collection.
              </div>
            )}
          </div>
          <div className="mt-8 flex items-center justify-between gap-4">
            <Button
              variant="secondary"
              onClick={() => {
                setPage((value) => Math.max(1, value - 1));
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page <= 1}
            >
              <ChevronLeft className="size-4" /> Previous
            </Button>
            <p className="text-xs tabular-nums text-muted">
              Page {hadiths.data.page.toLocaleString()} of{" "}
              {hadiths.data.totalPages.toLocaleString()}
            </p>
            <Button
              variant="secondary"
              onClick={() => {
                setPage((value) =>
                  Math.min(hadiths.data!.totalPages, value + 1),
                );
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              disabled={page >= hadiths.data.totalPages}
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
