"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Copy,
  Expand,
  Headphones,
  Pause,
  Play,
  Settings,
  Square,
  Volume2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useContentLanguage } from "@/components/content-language-provider";
import { MushafView } from "@/components/reader/mushaf-view";
import {
  ReaderSettings,
  SettingSection,
} from "@/components/reader/reader-settings";
import { getNextRecitationStep } from "@/components/reader/recitation";
import { TajweedText } from "@/components/reader/tajweed-text";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SurahReader, SurahSummary, Verse } from "@/types/quran";
import { RECITERS } from "@/types/quran";

const BISMILLAH =
  "بِسْمِ [h:1[ٱ]للَّهِ [h:2[ٱ][l[ل]رَّحْمَ[n[ـٰ]نِ [h:3[ٱ][l[ل]رَّح[p[ِي]مِ";
const TRANSLATION_ID = "en.sahih";
const ARABIC_RECITER = "مشاري راشد العفاسي";
const READER_FONT_SIZE_KEY = "islamichub:reader-font-size";
async function getJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("The Quran could not be loaded right now.");
  return (await response.json()).data;
}
function ArabicVerse({
  verse,
  size,
  tajweed,
  active,
}: {
  verse: Verse;
  size: number;
  tajweed: boolean;
  active: boolean;
}) {
  return (
    <p
      lang="ar"
      dir="rtl"
      className="quran-arabic text-right leading-[2.25] tracking-[.01em]"
      style={{ fontSize: `${size}px` }}
    >
      <TajweedText
        value={verse.tajweed}
        enabled={tajweed}
        className={cn("transition-colors duration-500", active && "text-ink")}
      />
    </p>
  );
}

export function Reader({ initialSurahId }: { initialSurahId: number }) {
  const { language, setLanguage, showTranslation, setShowTranslation } =
    useContentLanguage();
  const [surahId, setSurahId] = useState(
    Math.min(114, Math.max(1, initialSurahId || 1)),
  );
  const [fontSize, setFontSize] = useState(33);
  const [wide, setWide] = useState(false);
  const [tajweed, setTajweed] = useState(true);
  const [tajweedReady, setTajweedReady] = useState(false);
  const [mushafOpen, setMushafOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [audioIndex, setAudioIndex] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audioSession, setAudioSession] = useState(false);
  const [recitationStart, setRecitationStart] = useState(0);
  const [recitationEnd, setRecitationEnd] = useState(0);
  const [repeatCount, setRepeatCount] = useState(1);
  const [repeatIteration, setRepeatIteration] = useState(0);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());
  const audio = useRef<HTMLAudioElement>(null);
  const reducedMotion = useReducedMotion();
  const summaries = useQuery({
    queryKey: ["surahs"],
    queryFn: () => getJson<SurahSummary[]>("/api/reader/surahs"),
  });
  const reader = useQuery({
    queryKey: ["reader", surahId, TRANSLATION_ID],
    queryFn: () =>
      getJson<SurahReader>(
        `/api/reader/surahs/${surahId}?translations=${TRANSLATION_ID}`,
      ),
  });
  const verses = reader.data?.verses ?? [];
  const currentVerse = audioIndex === null ? null : verses[audioIndex];
  useEffect(() => {
    audio.current?.pause();
    setAudioIndex(null);
    setPlaying(false);
    setAudioSession(false);
    setRecitationStart(0);
    setRecitationEnd(Math.max(0, verses.length - 1));
    setRepeatIteration(0);
  }, [surahId, verses.length]);
  useEffect(() => {
    if (!currentVerse || !playing) return;
    const element = document.getElementById(`ayah-${currentVerse.number}`);
    if (element) {
      const box = element.getBoundingClientRect();
      if (box.top < 90 || box.bottom > window.innerHeight - 60)
        element.scrollIntoView({
          behavior: reducedMotion ? "auto" : "smooth",
          block: "center",
        });
    }
  }, [currentVerse, playing, reducedMotion]);
  useEffect(() => {
    try {
      setBookmarks(
        new Set(
          JSON.parse(localStorage.getItem("islamichub:bookmarks") ?? "[]"),
        ),
      );
      const storedTajweed = localStorage.getItem("islamichub:tajweed");
      setTajweed(storedTajweed === null ? true : storedTajweed === "true");
      const storedFontSize = Number(localStorage.getItem(READER_FONT_SIZE_KEY));
      if (Number.isFinite(storedFontSize) && storedFontSize > 0) {
        setFontSize(Math.min(72, Math.max(22, storedFontSize)));
      }
    } catch {
      /* invalid guest cache is ignored */
    } finally {
      setTajweedReady(true);
    }
  }, []);
  useEffect(() => {
    if (!tajweedReady) return;
    localStorage.setItem("islamichub:tajweed", String(tajweed));
  }, [tajweed, tajweedReady]);
  useEffect(() => {
    if (!tajweedReady) return;
    localStorage.setItem(READER_FONT_SIZE_KEY, String(fontSize));
  }, [fontSize, tajweedReady]);

  async function playIndex(index: number) {
    const verse = verses[index];
    const source = verse?.audio["ar.alafasy"];
    if (!verse || !source || !audio.current) return;
    setAudioIndex(index);
    setAudioSession(true);
    audio.current.src = source;
    try {
      await audio.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
      setAudioSession(false);
    }
  }

  function resetPlayback(nextIndex: number | null = recitationStart) {
    audio.current?.pause();
    audio.current?.removeAttribute("src");
    setPlaying(false);
    setAudioSession(false);
    setAudioIndex(nextIndex);
    setRepeatIteration(0);
  }

  function toggleAudio() {
    if (playing) {
      audio.current?.pause();
      setPlaying(false);
      return;
    }
    if (audio.current?.src && audioIndex !== null) {
      void audio.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
      return;
    }
    void playIndex(recitationStart);
  }

  function openMushaf() {
    resetPlayback(null);
    setMushafOpen(true);
  }

  function handleAudioEnded() {
    if (audioIndex === null) return;
    const step = getNextRecitationStep({
      currentIndex: audioIndex,
      startIndex: recitationStart,
      endIndex: recitationEnd,
      iteration: repeatIteration,
      repeatCount,
    });
    if (step.complete) {
      audio.current?.removeAttribute("src");
      setPlaying(false);
      setAudioSession(false);
      setAudioIndex(step.index);
      setRepeatIteration(step.iteration);
    } else {
      setRepeatIteration(step.iteration);
      void playIndex(step.index);
    }
  }

  function startFromVerse(verse: Verse) {
    const index = verses.findIndex((item) => item.key === verse.key);
    setRecitationStart(index);
    if (index > recitationEnd) setRecitationEnd(index);
    setRepeatIteration(0);
    void playIndex(index);
  }
  function toggleBookmark(key: string) {
    setBookmarks((previous) => {
      const next = new Set(previous);
      next.has(key) ? next.delete(key) : next.add(key);
      localStorage.setItem("islamichub:bookmarks", JSON.stringify([...next]));
      return next;
    });
  }
  if (reader.isLoading) return <ReaderSkeleton />;
  if (reader.isError || !reader.data)
    return (
      <div className="mx-auto max-w-xl px-4 py-28 text-center">
        <h1 className="text-xl font-semibold">Reader unavailable</h1>
        <p className="mt-2 text-muted">Check your connection and try again.</p>
        <Button className="mt-6" onClick={() => reader.refetch()}>
          Try again
        </Button>
      </div>
    );
  const data = reader.data;
  const showArabicContent = language === "ar" || showTranslation;
  const showEnglishContent = language === "en" || showTranslation;
  const bilingual = showArabicContent && showEnglishContent;
  const mushafPage = currentVerse?.page ?? verses[0]?.page ?? 1;
  return (
    <>
      <div
        className={cn(
          "mx-auto px-4 pb-20 pt-7 sm:px-6 sm:pt-10",
          wide ? "max-w-[106rem]" : "max-w-7xl",
        )}
      >
        <audio
          ref={audio}
          preload="none"
          onEnded={handleAudioEnded}
          onError={() => {
            setPlaying(false);
            setAudioSession(false);
          }}
        />
        <div className="mb-8 flex items-center gap-2 text-xs text-muted">
          <Link href="/" className="hover:text-ink">
            {language === "ar" ? "القرآن" : "Quran"}
          </Link>
          <span>/</span>
          <span
            lang={language}
            dir={language === "ar" ? "rtl" : "ltr"}
            className={cn("text-ink", language === "ar" && "arabic")}
          >
            {language === "ar" ? data.arabicName : data.name}
          </span>
        </div>
        <section>
          <div className="flex flex-col justify-between gap-7 border-b border-line pb-8 sm:flex-row sm:items-end">
            <div lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
              <p
                className={cn(
                  "text-xs font-semibold uppercase tracking-[.16em] text-accent",
                  language === "ar" && "arabic text-base tracking-normal",
                )}
              >
                {language === "ar"
                  ? `سورة ${data.id.toLocaleString("ar-EG")} · ${data.revelationType === "Meccan" ? "مكية" : "مدنية"}`
                  : `Surah ${data.id} · ${data.revelationType}`}
              </p>
              <h1
                className={cn(
                  "editorial mt-2 text-4xl tracking-[-.04em] sm:text-5xl",
                  language === "ar" &&
                    "arabic text-4xl font-medium leading-[1.7] tracking-normal text-ink sm:text-5xl",
                )}
              >
                {language === "ar" ? data.arabicName : data.name}
              </h1>
              <p
                className={cn(
                  "mt-2 text-sm text-muted",
                  language === "ar" && "arabic text-base",
                )}
              >
                {language === "ar"
                  ? `${data.versesCount.toLocaleString("ar-EG")} آيات`
                  : `${data.meaning} · ${data.versesCount} ayahs`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
              <label className="sr-only" htmlFor="surah-jump">
                {language === "ar" ? "اختر سورة" : "Choose surah"}
              </label>
              <select
                id="surah-jump"
                value={surahId}
                onChange={(event) => setSurahId(Number(event.target.value))}
                className={cn(
                  "col-span-2 h-10 rounded-lg border border-line bg-panel/60 px-3 text-sm outline-none focus:ring-2 focus:ring-accent sm:col-span-1",
                  language === "ar" && "arabic text-base",
                )}
              >
                {summaries.data?.map((surah) => (
                  <option value={surah.id} key={surah.id}>
                    {surah.id}.{" "}
                    {language === "ar" ? surah.arabicName : surah.name}
                  </option>
                ))}
              </select>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSurahId((id) => Math.max(1, id - 1))}
                disabled={surahId === 1}
              >
                <ChevronLeft className="size-4" />
                <span className={cn(language === "ar" && "arabic text-base")}>
                  {language === "ar" ? "السابق" : "Prev"}
                </span>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSurahId((id) => Math.min(114, id + 1))}
                disabled={surahId === 114}
              >
                <span className={cn(language === "ar" && "arabic text-base")}>
                  {language === "ar" ? "التالي" : "Next"}
                </span>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 border-b border-line py-3">
            <Button
              size="sm"
              variant={playing ? "primary" : "secondary"}
              onClick={toggleAudio}
            >
              {playing ? (
                <Pause className="size-4" />
              ) : (
                <Play className="size-4" />
              )}
              <span className={cn(language === "ar" && "arabic text-base")}>
                {language === "ar"
                  ? playing
                    ? "إيقاف مؤقت"
                    : "استماع"
                  : playing
                    ? "Pause"
                    : "Listen"}
              </span>
            </Button>
            <Button size="sm" variant="ghost" onClick={openMushaf}>
              <BookOpen className="size-4" />
              <span className={cn(language === "ar" && "arabic text-base")}>
                {language === "ar" ? "المصحف" : "Mushaf"}
              </span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="size-4" />
              <span className={cn(language === "ar" && "arabic text-base")}>
                {language === "ar" ? "الإعدادات" : "Settings"}
              </span>
            </Button>
            <div
              className={cn(
                "ml-auto flex items-center gap-1.5 text-xs text-muted",
                language === "ar" && "mr-auto ml-0 arabic text-sm",
              )}
            >
              <Volume2 className="size-3.5" />{" "}
              <span lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
                {language === "ar" ? ARABIC_RECITER : RECITERS[0].label}
              </span>
              {playing &&
                repeatCount > 1 &&
                ` · Pass ${repeatIteration + 1} of ${repeatCount}`}
            </div>
          </div>
          <div className={cn("mx-auto", wide ? "max-w-[92rem]" : "max-w-5xl")}>
            {showArabicContent && data.id !== 1 && data.id !== 9 && (
              <p
                lang="ar"
                dir="rtl"
                className="quran-arabic border-b border-line py-9 text-center text-3xl leading-[2.2]"
              >
                <TajweedText value={BISMILLAH} enabled={tajweed} />
              </p>
            )}
            <div className="divide-y divide-line">
              {verses.map((verse, index) => {
                const active = audioIndex === index && playing;
                return (
                  <motion.article
                    key={verse.key}
                    id={`ayah-${verse.number}`}
                    aria-current={active ? "true" : undefined}
                    initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.015, 0.2) }}
                    dir="ltr"
                    className={cn(
                      "group grid grid-cols-[36px_minmax(0,1fr)] gap-x-3 gap-y-2 px-1 py-8 transition-colors duration-500 sm:grid-cols-[48px_minmax(0,1fr)_44px] sm:gap-x-5 sm:px-5 sm:py-10",
                      active && "rounded-xl bg-accent/[.07]",
                    )}
                  >
                    <div className="relative mt-1 flex h-8 w-8 items-center justify-center rounded-full border border-line text-xs font-medium text-muted">
                      {verse.number}
                      {active && (
                        <motion.span
                          layoutId="playing-dot"
                          className="absolute -right-1 -top-1 size-2 rounded-full bg-accent ring-[3px] ring-canvas"
                        />
                      )}
                    </div>
                    <div
                      lang={language}
                      dir={language === "ar" ? "rtl" : "ltr"}
                      className="min-w-0"
                    >
                      {active && (
                        <p
                          className={cn(
                            "mb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-accent",
                            language === "ar" &&
                              "arabic text-sm tracking-normal",
                          )}
                        >
                          {language === "ar"
                            ? "تتم التلاوة الآن"
                            : "Now reciting"}
                        </p>
                      )}
                      {showArabicContent && (
                        <ArabicVerse
                          verse={verse}
                          size={fontSize}
                          tajweed={tajweed}
                          active={active}
                        />
                      )}
                      {showEnglishContent && (
                        <p
                          className={cn(
                            "text-[17px] leading-8 text-ink/80",
                            bilingual &&
                              "mt-5 border-t border-line pt-4 text-[16px] text-muted",
                          )}
                        >
                          {verse.translations[TRANSLATION_ID]}
                        </p>
                      )}
                    </div>
                    <div
                      className={cn(
                        "col-start-2 flex items-center gap-1 pt-3 transition-opacity sm:col-start-3 sm:row-start-1 sm:flex-col sm:pt-0",
                        active
                          ? "opacity-100"
                          : "opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => startFromVerse(verse)}
                        className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-sand hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        aria-label={
                          language === "ar"
                            ? `ابدأ التلاوة من الآية ${verse.number}`
                            : `Start recitation from ayah ${verse.number}`
                        }
                        title={language === "ar" ? "ابدأ من هنا" : "Start here"}
                      >
                        <Headphones className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleBookmark(verse.key)}
                        className={cn(
                          "grid size-9 place-items-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent",
                          bookmarks.has(verse.key)
                            ? "bg-accent text-white dark:text-canvas"
                            : "text-muted hover:bg-sand hover:text-ink",
                        )}
                        aria-label={
                          language === "ar"
                            ? bookmarks.has(verse.key)
                              ? "إزالة العلامة"
                              : "حفظ الآية"
                            : bookmarks.has(verse.key)
                              ? "Remove bookmark"
                              : "Save ayah"
                        }
                        aria-pressed={bookmarks.has(verse.key)}
                        title={language === "ar" ? "حفظ" : "Save"}
                      >
                        <Bookmark className="size-4" />
                      </button>
                      <button
                        type="button"
                        className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-sand hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        onClick={() =>
                          navigator.clipboard?.writeText(
                            `${language === "ar" ? verse.arabic : verse.translations[TRANSLATION_ID]}\nQuran ${verse.key}`,
                          )
                        }
                        aria-label={
                          language === "ar" ? "نسخ الآية" : "Copy ayah"
                        }
                        title={language === "ar" ? "نسخ" : "Copy"}
                      >
                        <Copy className="size-4" />
                      </button>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </section>
        <div className="mx-auto mt-6 flex max-w-5xl justify-between border-t border-line pt-5">
          <Button
            variant="quiet"
            onClick={() => setSurahId((id) => Math.max(1, id - 1))}
            disabled={surahId === 1}
          >
            {language === "ar" ? "السورة السابقة ←" : "← Previous surah"}
          </Button>
          <Button
            variant="quiet"
            onClick={() => setSurahId((id) => Math.min(114, id + 1))}
            disabled={surahId === 114}
          >
            {language === "ar" ? "السورة التالية →" : "Next surah →"}
          </Button>
        </div>
      </div>
      {audioSession && currentVerse && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
          <div
            className="pointer-events-auto flex w-full max-w-xl items-center gap-2 rounded-xl border border-line/80 bg-panel/95 p-1.5 shadow-[0_14px_45px_hsl(var(--ink)/.14)] backdrop-blur-xl"
            role="region"
            aria-label={
              language === "ar"
                ? "عناصر التحكم في التلاوة"
                : "Recitation controls"
            }
          >
            <button
              type="button"
              onClick={toggleAudio}
              className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-white transition hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent dark:text-canvas"
              aria-label={
                language === "ar"
                  ? playing
                    ? "إيقاف التلاوة مؤقتًا"
                    : "استئناف التلاوة"
                  : playing
                    ? "Pause recitation"
                    : "Resume recitation"
              }
            >
              {playing ? (
                <Pause className="size-5" />
              ) : (
                <Play className="ml-0.5 size-5" />
              )}
            </button>
            <div className="min-w-0 px-1" aria-live="polite">
              <p className="truncate text-xs font-medium">
                {language === "ar" ? data.arabicName : data.name}{" "}
                {currentVerse.key}
              </p>
              <p className="truncate text-[10px] text-muted">
                {language === "ar"
                  ? playing
                    ? "تتم التلاوة"
                    : "متوقفة مؤقتًا"
                  : playing
                    ? "Reciting"
                    : "Paused"}{" "}
                · {language === "ar" ? ARABIC_RECITER : RECITERS[0].label}
                {repeatCount > 1 &&
                  ` · Pass ${repeatIteration + 1} of ${repeatCount}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => resetPlayback(null)}
              className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-sand hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={
                language === "ar"
                  ? "إيقاف التلاوة وإغلاقها"
                  : "Stop and close recitation"
              }
              title={language === "ar" ? "إيقاف التلاوة" : "Stop recitation"}
            >
              <Square className="size-3.5 fill-current" />
            </button>
          </div>
        </div>
      )}
      <ReaderSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        minFontSize={22}
        tajweed={tajweed}
        onTajweedChange={setTajweed}
        recitationOptions={verses.map((verse, index) => ({
          value: index,
          label: `Ayah ${verse.number}`,
        }))}
        recitationStart={recitationStart}
        recitationEnd={recitationEnd}
        onRecitationStartChange={(value) => {
          setRecitationStart(value);
          if (value > recitationEnd) setRecitationEnd(value);
          resetPlayback(value);
        }}
        onRecitationEndChange={(value) => {
          setRecitationEnd(value);
          resetPlayback(recitationStart);
        }}
        repeatCount={repeatCount}
        onRepeatCountChange={(value) => {
          setRepeatCount(value);
          resetPlayback(recitationStart);
        }}
        viewSettings={
          <>
            <SettingSection
              title={language === "ar" ? "عرض القراءة" : "Reading width"}
              description={
                language === "ar"
                  ? "اختر عمودًا مركّزًا أو استفد من عرض الشاشة الكبيرة."
                  : "Choose a focused column or use more of a wide screen."
              }
            >
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setWide((value) => !value)}
                aria-pressed={wide}
              >
                <Expand className="size-4" />{" "}
                {language === "ar"
                  ? wide
                    ? "استخدام العرض المركّز"
                    : "استخدام مساحة قراءة واسعة"
                  : wide
                    ? "Use focused width"
                    : "Use wide reading area"}
              </Button>
            </SettingSection>
            <SettingSection
              title={language === "ar" ? "لغة القراءة" : "Reading language"}
              description={
                language === "ar"
                  ? "استخدم العربية وحدها، أو أضف إليها الترجمة الإنجليزية. يحتفظ عرض المصحف بالصفحة العربية دائمًا."
                  : "Use English alone, or add the original Arabic above it. Mushaf view always preserves the Arabic page."
              }
            >
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["en", language === "ar" ? "الإنجليزية" : "English"],
                    ["ar", "العربية"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLanguage(value)}
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs transition",
                      language === value
                        ? "border-accent bg-sand text-ink"
                        : "border-line text-muted hover:border-accent",
                      value === "ar" && "arabic text-base",
                    )}
                    aria-pressed={language === value}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas p-3">
                <input
                  type="checkbox"
                  checked={showTranslation}
                  onChange={(event) => setShowTranslation(event.target.checked)}
                  className="mt-0.5 size-4 accent-current"
                />
                <span>
                  <span
                    className={cn(
                      "block text-sm font-medium",
                      language === "ar" && "arabic text-base",
                    )}
                  >
                    {language === "ar"
                      ? "عرض الترجمة الإنجليزية"
                      : "Show original Arabic"}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block text-xs leading-5 text-muted",
                      language === "ar" && "arabic text-sm leading-6",
                    )}
                  >
                    {language === "ar"
                      ? "تضيف ترجمة إنجليزية واحدة أسفل كل آية عربية."
                      : "Places the Arabic text above the English translation."}
                  </span>
                </span>
              </label>
            </SettingSection>
          </>
        }
      />
      <MushafView
        open={mushafOpen}
        initialPage={mushafPage}
        onClose={() => setMushafOpen(false)}
        tajweed={tajweed}
        onTajweedChange={setTajweed}
      />
    </>
  );
}
function ReaderSkeleton() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-10 sm:px-6">
      <div className="h-5 w-32 rounded bg-sand" />
      <div className="mt-6 h-48 rounded-3xl border border-line bg-panel" />
      <div className="mt-6 space-y-7 rounded-3xl border border-line bg-panel p-8">
        {Array.from({ length: 5 }, (_, index) => (
          <div className="space-y-3" key={index}>
            <div className="ml-auto h-12 w-3/4 rounded bg-sand" />
            <div className="h-4 w-2/3 rounded bg-sand" />
          </div>
        ))}
      </div>
    </div>
  );
}
