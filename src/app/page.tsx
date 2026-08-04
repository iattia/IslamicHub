"use client";

import {
  ArrowRight,
  BookOpen,
  Clock3,
  Headphones,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useContentLanguage } from "@/components/content-language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const highlights = [
  {
    eyebrow: "Continue reading",
    arabicEyebrow: "متابعة القراءة",
    title: "Al-Baqarah",
    arabicTitle: "سورة البقرة",
    meta: "Chapter 2 · return to your place",
    arabicMeta: "السورة ٢ · عُد إلى موضعك",
    href: "/reader/2",
  },
  {
    eyebrow: "Daily reflection",
    arabicEyebrow: "تدبر اليوم",
    title: "With hardship comes ease.",
    arabicTitle: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    meta: "Ash-Sharh 94:5",
    arabicMeta: "الشرح ٩٤:٥",
    href: "/reader/94",
  },
  {
    eyebrow: "Listen again",
    arabicEyebrow: "استمع مجددًا",
    title: "Al-Kahf",
    arabicTitle: "سورة الكهف",
    meta: "A gentle recitation for Friday",
    arabicMeta: "تلاوة هادئة ليوم الجمعة",
    href: "/reader/18",
  },
];

const topics = [
  { english: "Mercy", arabic: "الرحمة" },
  { english: "Patience", arabic: "الصبر" },
  { english: "Prayer", arabic: "الصلاة" },
  { english: "Guidance", arabic: "الهداية" },
  { english: "Family", arabic: "الأسرة" },
  { english: "Gratitude", arabic: "الشكر" },
];

export default function HomePage() {
  const { language } = useContentLanguage();
  const arabic = language === "ar";

  return (
    <div
      lang={language}
      dir={arabic ? "rtl" : "ltr"}
      className="mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 sm:pt-14"
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-line bg-panel px-6 py-12 sm:px-12 sm:py-16">
        <div
          className={cn(
            "absolute inset-y-0 hidden w-[42%] paper-grid opacity-60 md:block",
            arabic ? "left-0" : "right-0",
          )}
        />
        <div className="relative max-w-2xl">
          <div
            className={cn(
              "mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-muted",
              arabic && "arabic text-base",
            )}
          >
            <Sparkles className="size-3.5 text-accent" />
            {arabic ? "مساحة متأنية للقرآن" : "A considered space for the Quran"}
          </div>
          <h1
            className={cn(
              "text-balance text-4xl font-semibold tracking-[-.045em] sm:text-6xl",
              arabic && "arabic leading-[1.45] tracking-normal",
            )}
          >
            {arabic ? "اقرأ بحضور." : "Read with presence."}
            <br />
            <span className="text-accent">
              {arabic ? "وادرس بوضوح." : "Study with clarity."}
            </span>
          </h1>
          <p
            className={cn(
              "mt-5 max-w-lg text-pretty leading-7 text-muted",
              arabic && "arabic text-xl leading-[1.9]",
            )}
          >
            {arabic
              ? "يجمع IslamicHub القراءة والاستماع وملاحظات الدراسة الخاصة في مساحة واحدة هادئة بلا تشتيت."
              : "IslamicHub brings reading, listening, and private study notes into one distraction-free home."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/reader/1">
              <Button size="lg" className={arabic ? "arabic text-lg" : undefined}>
                {arabic ? "افتح القرآن" : "Open the Quran"}
                <ArrowRight className={cn("size-4", arabic && "rotate-180")} />
              </Button>
            </Link>
            <Link href="/search">
              <Button
                size="lg"
                variant="secondary"
                className={arabic ? "arabic text-lg" : undefined}
              >
                <Search className="size-4" />
                {arabic ? "ابحث عن آية" : "Search a verse"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-14">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p
              className={cn(
                "text-xs font-semibold uppercase tracking-[.18em] text-accent",
                arabic && "arabic text-base tracking-normal",
              )}
            >
              {arabic ? "مساحتك" : "Your space"}
            </p>
            <h2
              className={cn(
                "mt-2 text-2xl font-semibold tracking-tight",
                arabic && "arabic text-3xl leading-[1.6] tracking-normal",
              )}
            >
              {arabic ? "تابع من حيث توقفت" : "Pick up where you left off"}
            </h2>
          </div>
          <Link
            className={cn(
              "hidden text-sm text-muted hover:text-ink sm:block",
              arabic && "arabic text-base",
            )}
            href="/collections"
          >
            {arabic ? "عرض العلامات ←" : "View bookmarks →"}
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {highlights.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-line bg-panel p-5 transition hover:-translate-y-0.5 hover:border-accent/40"
            >
              <div className="flex size-9 items-center justify-center rounded-xl bg-sand text-accent">
                {[
                  <BookOpen key="book" className="size-4" />,
                  <Sparkles key="reflection" className="size-4" />,
                  <Headphones key="audio" className="size-4" />,
                ][index]}
              </div>
              <p
                className={cn(
                  "mt-7 text-xs font-semibold uppercase tracking-[.14em] text-muted",
                  arabic && "arabic text-base tracking-normal",
                )}
              >
                {arabic ? item.arabicEyebrow : item.eyebrow}
              </p>
              <h3
                className={cn(
                  "mt-2 font-semibold",
                  arabic && "arabic text-xl leading-[1.7]",
                )}
              >
                {arabic ? item.arabicTitle : item.title}
              </h3>
              <p
                className={cn(
                  "mt-1 text-sm text-muted",
                  arabic && "arabic text-base leading-[1.8]",
                )}
              >
                {arabic ? item.arabicMeta : item.meta}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14 grid gap-8 rounded-3xl border border-line bg-sand/40 p-6 sm:p-8 lg:grid-cols-[1.2fr_.8fr]">
        <div>
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[.18em] text-accent",
              arabic && "arabic text-base tracking-normal",
            )}
          >
            {arabic ? "استكشف حسب الموضوع" : "Explore by theme"}
          </p>
          <h2
            className={cn(
              "mt-2 text-2xl font-semibold tracking-tight",
              arabic && "arabic text-3xl leading-[1.6] tracking-normal",
            )}
          >
            {arabic ? "ابدأ بما يشغل بالك." : "Begin with what is on your mind."}
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {topics.map((topic) => {
              const label = arabic ? topic.arabic : topic.english;
              return (
                <Link
                  key={topic.english}
                  href={`/search?q=${encodeURIComponent(label)}`}
                  className={cn(
                    "rounded-full border border-line bg-panel px-4 py-2 text-sm text-muted transition hover:border-accent hover:text-ink",
                    arabic && "arabic text-base",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="rounded-2xl bg-panel p-5">
          <Clock3 className="size-5 text-accent" />
          <p
            className={cn(
              "mt-6 text-sm font-medium",
              arabic && "arabic text-lg leading-[1.8]",
            )}
          >
            {arabic
              ? "إيقاع قراءة يناسب مكانك ووقتك."
              : "A reading rhythm that meets you where you are."}
          </p>
          <p
            className={cn(
              "mt-2 text-sm leading-6 text-muted",
              arabic && "arabic text-base leading-[1.9]",
            )}
          >
            {arabic
              ? "حدد هدفًا بالسورة أو الصفحة أو الجزء أو الآية، ودع تقدمك يبقى متزامنًا بهدوء."
              : "Set a goal by surah, page, juz, or verse and let your progress stay quietly in sync."}
          </p>
        </div>
      </section>
    </div>
  );
}
