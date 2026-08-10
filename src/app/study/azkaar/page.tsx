"use client";

import { Check, RotateCcw, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { useContentLanguage } from "@/components/content-language-provider";
import { StorageStatus } from "@/components/study/storage-status";
import { Button } from "@/components/ui/button";
import { AZKAAR } from "@/data/azkaar";
import { useStudyState } from "@/lib/use-study-state";
import { cn } from "@/lib/utils";

export default function AzkaarPage() {
  const [categoryId, setCategoryId] = useState(AZKAAR[0].id);
  const [showTransliteration, setShowTransliteration] = useState(true);
  const { language, showTranslation } = useContentLanguage();
  const showArabicContent = language === "ar" || showTranslation;
  const showEnglishContent = language === "en" || showTranslation;
  const bilingual = showArabicContent && showEnglishContent;
  const { state, update, storage } = useStudyState();
  const category = AZKAAR.find((item) => item.id === categoryId) ?? AZKAAR[0];
  const progress = useMemo(() => {
    const complete = category.items.filter(
      (item) => (state.azkar.counts[item.id] ?? 0) >= item.repetitions,
    ).length;
    return {
      complete,
      percent: Math.round((complete / category.items.length) * 100),
    };
  }, [category, state.azkar.counts]);

  function increment(id: string, repetitions: number) {
    update((current) => ({
      ...current,
      azkar: {
        ...current.azkar,
        counts: {
          ...current.azkar.counts,
          [id]: Math.min(repetitions, (current.azkar.counts[id] ?? 0) + 1),
        },
      },
    }));
  }

  function resetCategory() {
    update((current) => {
      const counts = { ...current.azkar.counts };
      category.items.forEach((item) => delete counts[item.id]);
      return { ...current, azkar: { ...current.azkar, counts } };
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex justify-end">
        <StorageStatus storage={storage} />
      </div>
      <header className="mt-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div
          className="max-w-2xl"
          lang={language}
          dir={language === "ar" ? "rtl" : "ltr"}
        >
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-accent">
            {language === "ar" ? "الذكر اليومي" : "Daily remembrance"}
          </p>
          <h1
            className={cn(
              "mt-2 text-4xl font-semibold tracking-tight sm:text-5xl",
              language === "ar" && "arabic leading-[1.7]",
            )}
          >
            {language === "ar"
              ? "أذكارٌ ترافق يومك"
              : "Azkaar for the rhythms of your day."}
          </h1>
          <p className="mt-4 leading-7 text-muted">
            {language === "ar"
              ? "أذكار مرتبة مع عدد التكرار والمراجع لتيسير المداومة اليومية."
              : "Supplications with optional transliteration, repetition targets, and source references."}
          </p>
        </div>
        {language === "en" && (
          <label className="flex items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={showTransliteration}
              onChange={(event) => setShowTransliteration(event.target.checked)}
              className="size-4 accent-current"
            />{" "}
            Transliteration
          </label>
        )}
      </header>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none]">
        {AZKAAR.map((item) => (
          <button
            key={item.id}
            onClick={() => setCategoryId(item.id)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm transition",
              category.id === item.id
                ? "border-ink bg-ink text-canvas"
                : "border-line bg-panel text-muted hover:border-accent hover:text-ink",
            )}
          >
            {language === "ar" ? item.arabicTitle : item.title}
          </button>
        ))}
      </div>

      <section className="mt-5 rounded-3xl border border-line bg-sand/45 p-5 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
            <h2
              className={cn(
                "text-2xl font-semibold",
                language === "ar" && "arabic text-3xl leading-[1.8]",
              )}
            >
              {language === "ar" ? category.arabicTitle : category.title}
            </h2>
            {language === "en" && (
              <p className="mt-2 text-sm text-muted">{category.description}</p>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={resetCategory}>
            <RotateCcw className="size-4" />
            {language === "ar" ? "إعادة" : "Reset"}
          </Button>
        </div>
        <div className="mt-5 h-2 overflow-hidden rounded-full bg-panel">
          <div
            className="h-full rounded-full bg-accent transition-[width]"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {language === "ar"
            ? `أُنجز ${progress.complete.toLocaleString("ar-EG")} من ${category.items.length.toLocaleString("ar-EG")} اليوم`
            : `${progress.complete} of ${category.items.length} completed today`}
        </p>
      </section>

      <div className="mt-5 space-y-4">
        {category.items.map((item, index) => {
          const count = state.azkar.counts[item.id] ?? 0;
          const complete = count >= item.repetitions;
          return (
            <article
              key={item.id}
              className={cn(
                "rounded-3xl border bg-panel p-5 transition sm:p-8",
                complete ? "border-accent/50" : "border-line",
              )}
            >
              <div className="flex items-center justify-between gap-4 text-xs text-muted">
                <span>
                  {String(index + 1).padStart(2, "0")} · {item.reference}
                </span>
                {complete && (
                  <span className="flex items-center gap-1 font-medium text-accent">
                    <Check className="size-3.5" />
                    {language === "ar" ? "تم" : "Complete"}
                  </span>
                )}
              </div>
              {showArabicContent && (
                <p
                  lang="ar"
                  dir="rtl"
                  className="arabic-prose mt-6 text-right text-[1.8rem] sm:text-[2.05rem]"
                >
                  {item.arabic}
                </p>
              )}
              {language === "en" && showTransliteration && (
                <p className="mt-5 text-sm italic leading-7 text-muted">
                  {item.transliteration}
                </p>
              )}
              {showEnglishContent && (
                <p
                  className={cn(
                    "text-[17px] leading-8 text-ink/80",
                    bilingual
                      ? "mt-5 border-t border-line pt-5 text-muted"
                      : "mt-4",
                  )}
                >
                  {item.translation}
                </p>
              )}
              <div className="mt-6 flex items-center justify-between gap-4">
                <p
                  dir={language === "ar" ? "rtl" : "ltr"}
                  className="text-xs text-muted"
                >
                  {language === "ar"
                    ? `التكرار الموصى به: ${item.repetitions.toLocaleString("ar-EG")} ${item.repetitions === 1 ? "مرة" : "مرات"}`
                    : `Recommended: ${item.repetitions}×`}
                </p>
                <button
                  type="button"
                  onClick={() => increment(item.id, item.repetitions)}
                  disabled={complete}
                  className={cn(
                    "flex min-h-12 min-w-32 items-center justify-center gap-2 rounded-full border px-5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    complete
                      ? "border-accent bg-accent text-canvas"
                      : "border-line bg-canvas hover:border-accent",
                  )}
                  aria-label={
                    complete
                      ? `${item.repetitions} repetitions complete`
                      : `Count repetition ${count + 1} of ${item.repetitions}`
                  }
                >
                  <Sparkles className="size-4" />{" "}
                  {complete
                    ? language === "ar"
                      ? "تم"
                      : "Done"
                    : language === "ar"
                      ? `${count.toLocaleString("ar-EG")} / ${item.repetitions.toLocaleString("ar-EG")}`
                      : `${count} / ${item.repetitions}`}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
