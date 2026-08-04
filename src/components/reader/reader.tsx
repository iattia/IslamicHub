"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
  BookOpen,
  Bookmark,
  ChevronLeft,
  ChevronRight,
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
      className="arabic text-right leading-[2.15] tracking-[.015em]"
      style={{ fontSize: `${size}px` }}
    >
      <TajweedText
        value={verse.tajweed}
        enabled={tajweed}
        className={cn(
          "rounded-md py-[.2em] transition-colors duration-500 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
          active && "bg-accent/10",
        )}
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
  const [tajweed, setTajweed] = useState(false);
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
      setTajweed(localStorage.getItem("islamichub:tajweed") === "true");
    } catch {
      /* invalid guest cache is ignored */
    }
  }, []);
  useEffect(() => {
    localStorage.setItem("islamichub:tajweed", String(tajweed));
  }, [tajweed]);

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
  const mushafPage = currentVerse?.page ?? verses[0]?.page ?? 1;
  return (
    <>
      <div
        className={cn(
          "mx-auto px-4 py-7 sm:px-6 sm:py-10",
          wide ? "max-w-[106rem]" : "max-w-5xl",
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
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <Link href="/" className="hover:text-ink">
              Quran
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
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSettingsOpen(true)}
              aria-label="Open reader settings"
              aria-expanded={settingsOpen}
            >
              <Settings className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMushafOpen(true)}
              aria-label="Open Mushaf view"
            >
              <BookOpen className="size-4" />
            </Button>
          </div>
        </div>
        <section className="rounded-3xl border border-line bg-panel p-5 sm:p-8">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
              <p className="text-xs font-semibold uppercase tracking-[.16em] text-accent">
                {language === "ar"
                  ? `سورة ${data.id.toLocaleString("ar-EG")} · ${data.revelationType === "Meccan" ? "مكية" : "مدنية"}`
                  : `Surah ${data.id} · ${data.revelationType}`}
              </p>
              <h1
                className={cn(
                  "mt-2 text-3xl font-semibold tracking-tight sm:text-4xl",
                  language === "ar" && "arabic leading-[1.7] text-accent",
                )}
              >
                {language === "ar" ? data.arabicName : data.name}
              </h1>
              <p className="mt-2 text-sm text-muted">
                {language === "ar"
                  ? `${data.versesCount.toLocaleString("ar-EG")} آيات`
                  : `${data.meaning} · ${data.versesCount} ayahs`}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <label className="sr-only" htmlFor="surah-jump">
                Choose surah
              </label>
              <select
                id="surah-jump"
                value={surahId}
                onChange={(event) => setSurahId(Number(event.target.value))}
                className="h-10 rounded-xl border border-line bg-canvas px-3 text-sm focus:ring-2 focus:ring-accent"
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
                <ChevronLeft className="size-4" /> Prev
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setSurahId((id) => Math.min(114, id + 1))}
                disabled={surahId === 114}
              >
                Next <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 border-y border-line py-3">
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
              {playing ? "Pause" : "Listen"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setMushafOpen(true)}
            >
              <BookOpen className="size-4" /> Mushaf
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="size-4" /> Settings
            </Button>
            <div className="ml-auto flex items-center gap-1 text-xs text-muted">
              <Volume2 className="size-3.5" />{" "}
              <span lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
                {language === "ar" ? ARABIC_RECITER : RECITERS[0].label}
              </span>
              {playing &&
                repeatCount > 1 &&
                ` · Pass ${repeatIteration + 1} of ${repeatCount}`}
            </div>
          </div>
          {language === "ar" && data.id !== 1 && data.id !== 9 && (
            <p
              lang="ar"
              dir="rtl"
              className="arabic border-y border-line py-8 text-center text-3xl"
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
                  className={cn(
                    "group grid gap-4 border-l-2 border-l-transparent py-8 transition-colors duration-500 sm:grid-cols-[44px_1fr]",
                    active && "border-l-accent",
                  )}
                >
                  <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-line text-xs font-medium text-muted">
                    {verse.number}
                    {active && (
                      <motion.span
                        layoutId="playing-dot"
                        className="absolute -right-1 -top-1 size-2.5 rounded-full bg-accent ring-4 ring-panel"
                      />
                    )}
                  </div>
                  <div>
                    {active && (
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[.14em] text-accent">
                        Now reciting
                      </p>
                    )}
                    {language === "ar" ? (
                      <>
                        <ArabicVerse
                          verse={verse}
                          size={fontSize}
                          tajweed={tajweed}
                          active={active}
                        />
                        {showTranslation && (
                          <p className="mt-5 border-t border-line pt-4 text-[16px] leading-8 text-muted">
                            {verse.translations[TRANSLATION_ID]}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-[17px] leading-8 text-ink/80">
                        {verse.translations[TRANSLATION_ID]}
                      </p>
                    )}
                    <div
                      className={cn(
                        "mt-4 flex items-center gap-1 transition",
                        active
                          ? "opacity-100"
                          : "opacity-100 sm:opacity-0 sm:group-hover:opacity-100",
                      )}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startFromVerse(verse)}
                        aria-label={`Start recitation from ayah ${verse.number}`}
                      >
                        <Headphones className="size-3.5" /> Start here
                      </Button>
                      <Button
                        size="sm"
                        variant={bookmarks.has(verse.key) ? "primary" : "ghost"}
                        onClick={() => toggleBookmark(verse.key)}
                        aria-pressed={bookmarks.has(verse.key)}
                      >
                        <Bookmark className="size-3.5" />{" "}
                        {bookmarks.has(verse.key) ? "Saved" : "Save"}
                      </Button>
                      <button
                        className="focus-ring ml-auto text-xs text-muted hover:text-ink"
                        onClick={() =>
                          navigator.clipboard?.writeText(
                            `${language === "ar" ? verse.arabic : verse.translations[TRANSLATION_ID]}\nQuran ${verse.key}`,
                          )
                        }
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
        <div className="mt-6 flex justify-between">
          <Button
            variant="quiet"
            onClick={() => setSurahId((id) => Math.max(1, id - 1))}
            disabled={surahId === 1}
          >
            ← Previous surah
          </Button>
          <Button
            variant="quiet"
            onClick={() => setSurahId((id) => Math.min(114, id + 1))}
            disabled={surahId === 114}
          >
            Next surah →
          </Button>
        </div>
      </div>
      {audioSession && currentVerse && (
        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
          <div
            className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-line/80 bg-panel/95 p-1.5 shadow-lg backdrop-blur"
            role="region"
            aria-label="Recitation controls"
          >
            <button
              type="button"
              onClick={toggleAudio}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-canvas transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={playing ? "Pause recitation" : "Resume recitation"}
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
                {playing ? "Reciting" : "Paused"} ·{" "}
                {language === "ar" ? ARABIC_RECITER : RECITERS[0].label}
                {repeatCount > 1 &&
                  ` · Pass ${repeatIteration + 1} of ${repeatCount}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => resetPlayback(null)}
              className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-sand hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Stop and close recitation"
              title="Stop recitation"
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
                  ? "اختر لغة واحدة لعرض الآيات. يحتفظ عرض المصحف بالصفحة العربية دائمًا."
                  : "Keep the verse view in one language at a time. Mushaf view always preserves the Arabic page."
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
              {language === "ar" && (
                <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-canvas p-3">
                  <input
                    type="checkbox"
                    checked={showTranslation}
                    onChange={(event) =>
                      setShowTranslation(event.target.checked)
                    }
                    className="mt-0.5 size-4 accent-current"
                  />
                  <span>
                    <span className="block text-sm font-medium">
                      {language === "ar"
                        ? "عرض الترجمة الإنجليزية"
                        : "Show English translation"}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted">
                      {language === "ar"
                        ? "تضيف ترجمة إنجليزية واحدة أسفل كل آية عربية."
                        : "Adds one English translation beneath each Arabic ayah."}
                    </span>
                  </span>
                </label>
              )}
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
