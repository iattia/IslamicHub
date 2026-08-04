"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Settings,
  Square,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppearancePicker } from "@/components/appearance-picker";
import { useContentLanguage } from "@/components/content-language-provider";
import {
  ReaderSettings,
  SettingSection,
} from "@/components/reader/reader-settings";
import { getNextRecitationStep } from "@/components/reader/recitation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MushafAyah, MushafPage as MushafPageData } from "@/types/quran";
import { TajweedText } from "./tajweed-text";

const LAST_MUSHAF_PAGE = 604;
const BISMILLAH =
  "بِسْمِ [h:1[ٱ]للَّهِ [h:2[ٱ][l[ل]رَّحْمَ[n[ـٰ]نِ [h:3[ٱ][l[ل]رَّح[p[ِي]مِ";

async function fetchPage(page: number): Promise<MushafPageData> {
  const response = await fetch(`/api/reader/pages/${page}`);
  if (!response.ok) throw new Error("Page unavailable");
  return (await response.json()).data as MushafPageData;
}

type MushafViewProps = {
  open: boolean;
  initialPage: number;
  onClose: () => void;
  tajweed: boolean;
  onTajweedChange: (enabled: boolean) => void;
};

export function MushafView({
  open,
  initialPage,
  onClose,
  tajweed,
  onTajweedChange,
}: MushafViewProps) {
  const { language } = useContentLanguage();
  const [page, setPage] = useState(initialPage);
  const [spread, setSpread] = useState<1 | 2>(1);
  const [fontSize, setFontSize] = useState(25);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [audioIndex, setAudioIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [recitationStart, setRecitationStart] = useState(0);
  const [recitationEnd, setRecitationEnd] = useState(0);
  const [repeatCount, setRepeatCount] = useState(1);
  const [repeatIteration, setRepeatIteration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentQuery = useQuery({
    queryKey: ["mushaf-page", page],
    queryFn: () => fetchPage(page),
    enabled: open,
    staleTime: 86_400_000,
  });
  const nextPage = Math.min(LAST_MUSHAF_PAGE, page + 1);
  const nextQuery = useQuery({
    queryKey: ["mushaf-page", nextPage],
    queryFn: () => fetchPage(nextPage),
    enabled: open && spread === 2 && page < LAST_MUSHAF_PAGE,
    staleTime: 86_400_000,
  });

  const readingQueue = useMemo(
    () => [
      ...(currentQuery.data?.ayahs ?? []),
      ...(spread === 2 && page < LAST_MUSHAF_PAGE
        ? (nextQuery.data?.ayahs ?? [])
        : []),
    ],
    [currentQuery.data, nextQuery.data, page, spread],
  );
  const activeAyah = readingQueue[audioIndex];
  const recitationOptions = useMemo(
    () =>
      readingQueue.map((ayah, index) => ({
        value: index,
        label: `${language === "ar" ? ayah.surah.arabicName : ayah.surah.name} ${ayah.key}`,
      })),
    [language, readingQueue],
  );

  const changePage = useCallback(
    (direction: -1 | 1) => {
      setPage((value) =>
        Math.min(LAST_MUSHAF_PAGE, Math.max(1, value + direction * spread)),
      );
    },
    [spread],
  );

  useEffect(() => {
    if (open) setPage(initialPage);
  }, [initialPage, open]);

  useEffect(() => {
    audioRef.current?.pause();
    setPlaying(false);
    setAudioIndex(0);
    setRecitationStart(0);
    setRecitationEnd(Math.max(0, readingQueue.length - 1));
    setRepeatIteration(0);
  }, [page, readingQueue.length, spread]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (settingsOpen) setSettingsOpen(false);
        else onClose();
      }
      if (event.key === "ArrowLeft" && !settingsOpen) changePage(1);
      if (event.key === "ArrowRight" && !settingsOpen) changePage(-1);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [changePage, onClose, open, settingsOpen]);

  const playAyah = async (index: number) => {
    const ayah = readingQueue[index];
    if (!ayah || !audioRef.current) return;
    setAudioIndex(index);
    audioRef.current.src = `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${ayah.id}.mp3`;
    try {
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  };

  const toggleAudio = () => {
    if (playing) {
      audioRef.current?.pause();
      setPlaying(false);
      return;
    }
    if (audioRef.current?.src && activeAyah) {
      void audioRef.current
        .play()
        .then(() => setPlaying(true))
        .catch(() => setPlaying(false));
      return;
    }
    void playAyah(recitationStart);
  };

  const onAudioEnded = () => {
    const step = getNextRecitationStep({
      currentIndex: audioIndex,
      startIndex: recitationStart,
      endIndex: recitationEnd,
      iteration: repeatIteration,
      repeatCount,
    });
    if (step.complete) {
      setPlaying(false);
      setAudioIndex(step.index);
      setRepeatIteration(step.iteration);
    } else {
      setRepeatIteration(step.iteration);
      void playAyah(step.index);
    }
  };

  const resetPlayback = (nextIndex = recitationStart) => {
    audioRef.current?.pause();
    audioRef.current?.removeAttribute("src");
    setPlaying(false);
    setAudioIndex(nextIndex);
    setRepeatIteration(0);
  };

  if (!open) return null;

  const displayedPages =
    spread === 2 && nextQuery.data
      ? ([nextQuery.data, currentQuery.data].filter(
          Boolean,
        ) as MushafPageData[])
      : currentQuery.data
        ? [currentQuery.data]
        : [];

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-canvas"
      role="dialog"
      aria-modal="true"
      aria-label="Mushaf reader"
    >
      <audio
        ref={audioRef}
        preload="none"
        onEnded={onAudioEnded}
        onError={() => setPlaying(false)}
      />

      <header className="relative z-30 grid h-14 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-b border-line/60 bg-canvas/90 px-2 backdrop-blur sm:px-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="w-fit"
          aria-label={language === "ar" ? "إغلاق المصحف" : "Close Mushaf"}
        >
          <X className="size-4" />
          <span
            className={cn("hidden sm:inline", language === "ar" && "arabic")}
          >
            {language === "ar" ? "إغلاق" : "Close"}
          </span>
        </Button>
        <p className="text-xs font-semibold uppercase tracking-[.16em] text-muted">
          {language === "ar" ? "المصحف" : "Mushaf"}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSettingsOpen(true)}
          className="ml-auto"
          aria-label={
            language === "ar" ? "فتح إعدادات المصحف" : "Open Mushaf settings"
          }
          aria-expanded={settingsOpen}
        >
          <Settings className="size-4" />
          <span
            className={cn("hidden sm:inline", language === "ar" && "arabic")}
          >
            {language === "ar" ? "الإعدادات" : "Settings"}
          </span>
        </Button>
      </header>

      <main className="relative min-h-0 flex-1 overflow-auto bg-sand/30 p-2 sm:p-5">
        <div
          className={cn(
            "mx-auto grid min-h-full w-full items-stretch gap-1",
            spread === 1
              ? "max-w-3xl grid-cols-1"
              : "max-w-[98rem] grid-cols-1 lg:grid-cols-2",
          )}
          dir="ltr"
        >
          {currentQuery.isLoading && (
            <div className="mushaf-page min-h-[calc(100dvh-5rem)] animate-pulse rounded-sm border border-line bg-panel" />
          )}
          {currentQuery.isError && (
            <div className="mushaf-page grid min-h-[calc(100dvh-5rem)] place-items-center rounded-sm border border-line text-sm text-muted">
              This page could not be loaded.
            </div>
          )}
          {displayedPages.map((pageData) => (
            <MushafSheet
              key={pageData.number}
              data={pageData}
              fontSize={fontSize}
              tajweed={tajweed}
              activeAyahId={playing ? activeAyah?.id : undefined}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => changePage(1)}
          disabled={page >= LAST_MUSHAF_PAGE}
          className="group fixed inset-y-14 left-0 z-20 flex w-10 items-center justify-start pl-1 text-muted/0 transition hover:bg-gradient-to-r hover:from-ink/5 hover:text-muted focus-visible:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent disabled:hidden sm:w-16 sm:pl-3"
          aria-label={`Next page${spread === 2 ? "s" : ""}`}
          title="Next page (Left arrow)"
        >
          <ChevronLeft className="size-6 transition-transform group-hover:-translate-x-0.5" />
        </button>
        <button
          type="button"
          onClick={() => changePage(-1)}
          disabled={page <= 1}
          className="group fixed inset-y-14 right-0 z-20 flex w-10 items-center justify-end pr-1 text-muted/0 transition hover:bg-gradient-to-l hover:from-ink/5 hover:text-muted focus-visible:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent disabled:hidden sm:w-16 sm:pr-3"
          aria-label={`Previous page${spread === 2 ? "s" : ""}`}
          title="Previous page (Right arrow)"
        >
          <ChevronRight className="size-6 transition-transform group-hover:translate-x-0.5" />
        </button>

        <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center px-4">
          <div className="pointer-events-auto flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-full border border-line/80 bg-panel/90 p-1.5 pr-3 shadow-lg backdrop-blur">
            <button
              type="button"
              onClick={toggleAudio}
              disabled={readingQueue.length === 0}
              className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-canvas transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
              aria-label={
                playing ? "Pause Mushaf recitation" : "Play Mushaf recitation"
              }
            >
              {playing ? (
                <Pause className="size-5" />
              ) : (
                <Play className="ml-0.5 size-5" />
              )}
            </button>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium">
                {activeAyah
                  ? `${activeAyah.surah.name} ${activeAyah.key}`
                  : "Page recitation"}
              </p>
              {playing && (
                <p className="text-[10px] text-muted">
                  Mishary Rashid Alafasy
                  {repeatCount > 1 &&
                    ` · Pass ${repeatIteration + 1} of ${repeatCount}`}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => resetPlayback(recitationStart)}
              className="grid size-10 shrink-0 place-items-center rounded-full text-muted transition hover:bg-sand hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label="Stop Mushaf recitation"
              title="Stop recitation"
            >
              <Square className="size-3.5 fill-current" />
            </button>
          </div>
        </div>
      </main>

      <ReaderSettings
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        tajweed={tajweed}
        onTajweedChange={onTajweedChange}
        recitationOptions={recitationOptions}
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
              title={language === "ar" ? "المظهر" : "Appearance"}
              description={
                language === "ar"
                  ? "اختر المظهر الفاتح أو الداكن أو البيج، أو اتبع النظام."
                  : "Choose light, dark, beige, or follow your system."
              }
            >
              <AppearancePicker language={language} />
            </SettingSection>
            <SettingSection
              title={language === "ar" ? "الانتقال إلى صفحة" : "Go to page"}
              description={
                language === "ar"
                  ? "أدخل رقم صفحة من 1 إلى 604."
                  : "Enter a page from 1 to 604."
              }
            >
              <label className="flex items-center gap-3 rounded-xl border border-line bg-canvas px-3 py-2 text-sm">
                <span className="text-muted">
                  {language === "ar" ? "صفحة" : "Page"}
                </span>
                <input
                  value={page}
                  onChange={(event) =>
                    setPage(
                      Math.min(
                        LAST_MUSHAF_PAGE,
                        Math.max(1, Number(event.target.value) || 1),
                      ),
                    )
                  }
                  inputMode="numeric"
                  aria-label={
                    language === "ar" ? "رقم صفحة المصحف" : "Mushaf page number"
                  }
                  className="min-w-0 flex-1 bg-transparent text-right font-medium text-ink outline-none"
                />
                <span className="text-xs text-muted">/ {LAST_MUSHAF_PAGE}</span>
              </label>
            </SettingSection>
            <SettingSection
              title={language === "ar" ? "تخطيط الصفحات" : "Page layout"}
              description={
                language === "ar"
                  ? "يكون عرض الصفحتين أكثر راحة على الشاشات الكبيرة."
                  : "Two-page view is most comfortable on a larger screen."
              }
            >
              <div
                className="grid grid-cols-2 rounded-xl border border-line bg-canvas p-1"
                aria-label={language === "ar" ? "تخطيط الصفحات" : "Page layout"}
              >
                {([1, 2] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSpread(value)}
                    className={cn(
                      "rounded-lg px-3 py-2 text-sm transition",
                      spread === value
                        ? "bg-ink text-canvas"
                        : "text-muted hover:text-ink",
                    )}
                    aria-pressed={spread === value}
                  >
                    {language === "ar"
                      ? value === 1
                        ? "صفحة واحدة"
                        : "صفحتان"
                      : `${value} page${value === 2 ? "s" : ""}`}
                  </button>
                ))}
              </div>
            </SettingSection>
          </>
        }
      />
    </div>
  );
}

function MushafSheet({
  data,
  fontSize,
  tajweed,
  activeAyahId,
}: {
  data: MushafPageData;
  fontSize: number;
  tajweed: boolean;
  activeAyahId?: number;
}) {
  return (
    <section
      className="mushaf-page relative mx-auto flex h-[calc(100dvh-5rem)] min-h-[36rem] w-full max-w-3xl flex-col overflow-hidden rounded-sm border border-line px-[7%] pb-[4%] pt-[3%]"
      aria-label={`Mushaf page ${data.number}`}
    >
      <div className="mb-2 flex shrink-0 items-center justify-between border-b border-line/60 pb-2 text-[10px] text-muted">
        <span>Juz {data.ayahs[0]?.juz}</span>
        <span>القرآن الكريم</span>
      </div>
      <div
        lang="ar"
        dir="rtl"
        className="arabic min-h-0 flex-1 overflow-y-auto text-justify leading-[2.05] [scrollbar-width:thin]"
        style={{ fontSize: `${fontSize}px` }}
      >
        {data.ayahs.map((ayah) => (
          <MushafAyahText
            key={ayah.key}
            ayah={ayah}
            tajweed={tajweed}
            active={activeAyahId === ayah.id}
          />
        ))}
      </div>
      <div className="mt-2 shrink-0 text-center text-[10px] text-muted">
        {data.number}
      </div>
    </section>
  );
}

function MushafAyahText({
  ayah,
  tajweed,
  active,
}: {
  ayah: MushafAyah;
  tajweed: boolean;
  active: boolean;
}) {
  return (
    <span aria-current={active ? "true" : undefined}>
      {ayah.number === 1 && (
        <>
          <span className="my-2 block rounded-full border-y border-line bg-sand/50 px-4 py-1 text-center text-[.8em] font-semibold">
            {ayah.surah.arabicName}
          </span>
          {ayah.surah.id !== 1 && ayah.surah.id !== 9 && (
            <span className="mb-2 block text-center text-[.8em]">
              <TajweedText value={BISMILLAH} enabled={tajweed} />
            </span>
          )}
        </>
      )}
      <TajweedText
        value={ayah.tajweed}
        enabled={tajweed}
        className={cn(
          "rounded-md py-[.2em] transition-colors duration-500 [box-decoration-break:clone] [-webkit-box-decoration-break:clone]",
          active && "bg-accent/10",
        )}
      />{" "}
      <span className="mx-1 inline-grid size-[1.8em] place-items-center rounded-full border border-accent/40 align-middle text-[.5em] text-accent">
        {new Intl.NumberFormat("ar-EG").format(ayah.number)}
      </span>{" "}
    </span>
  );
}
