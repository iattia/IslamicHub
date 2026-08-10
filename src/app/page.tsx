"use client";

import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock3,
  Headphones,
  Search,
  Sparkles,
  Target,
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
    icon: BookOpen,
  },
  {
    eyebrow: "Daily reflection",
    arabicEyebrow: "تدبر اليوم",
    title: "With hardship comes ease.",
    arabicTitle: "فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا",
    meta: "Ash-Sharh 94:5",
    arabicMeta: "الشرح ٩٤:٥",
    href: "/reader/94",
    icon: Sparkles,
  },
  {
    eyebrow: "Recently listened",
    arabicEyebrow: "استمعت إليه مؤخرًا",
    title: "Al-Kahf",
    arabicTitle: "سورة الكهف",
    meta: "Mishary Rashid Alafasy",
    arabicMeta: "مشاري راشد العفاسي",
    href: "/reader/18",
    icon: Headphones,
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
      className="mx-auto max-w-[90rem] px-4 pb-20 sm:px-6 lg:px-10"
    >
      <section className="grid min-h-[38rem] items-center gap-14 border-b border-line py-16 sm:py-20 lg:grid-cols-[1.08fr_.92fr] lg:gap-20 lg:py-24">
        <div className="max-w-2xl">
          <h1
            className={cn(
              "editorial text-balance text-[3.4rem] leading-[.98] tracking-[-.055em] sm:text-[4.65rem]",
              arabic &&
                "arabic max-w-xl text-[3.3rem] font-medium leading-[1.45] tracking-normal sm:text-[4.5rem]",
            )}
          >
            {arabic ? "مساحة هادئة" : "A quieter way"}
            <br />
            <span className="text-accent">
              {arabic ? "للقراءة والتدبر." : "to read and reflect."}
            </span>
          </h1>
          <p
            className={cn(
              "mt-7 max-w-xl text-pretty text-[17px] leading-8 text-muted",
              arabic && "arabic text-xl leading-[2]",
            )}
          >
            {arabic
              ? "اقرأ القرآن، واستمع إلى التلاوة، ونظّم دراستك اليومية في مكان واحد صُمم للتركيز والسكينة."
              : "Read the Quran, listen to recitation, and keep your daily study together in one calm, focused place."}
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/reader/1">
              <Button
                size="lg"
                className={arabic ? "arabic text-lg" : undefined}
              >
                {arabic ? "ابدأ القراءة" : "Start reading"}
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
                {arabic ? "ابحث في القرآن" : "Search the Quran"}
              </Button>
            </Link>
          </div>
        </div>

        <div
          className={cn(
            "relative border-line lg:border-l lg:pl-14",
            arabic && "lg:border-l-0 lg:border-r lg:pl-0 lg:pr-14",
          )}
        >
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.14em] text-accent">
              <Clock3 className="size-4" />
              <span
                className={cn(arabic && "arabic text-base tracking-normal")}
              >
                {arabic ? "آية اليوم" : "Today’s verse"}
              </span>
            </div>
            <span
              className={cn("text-xs text-muted", arabic && "arabic text-base")}
            >
              {arabic ? "الشرح ٩٤:٥" : "Ash-Sharh 94:5"}
            </span>
          </div>
          <blockquote className="py-9 sm:py-12">
            <p
              lang="ar"
              dir="rtl"
              className="quran-arabic text-right text-[2.25rem] leading-[2.15] text-ink sm:text-[2.8rem]"
            >
              فَإِنَّ مَعَ ٱلْعُسْرِ يُسْرًا
            </p>
            <p
              className={cn(
                "mt-6 max-w-lg text-[15px] leading-7 text-muted",
                arabic && "arabic text-lg leading-[1.9]",
              )}
            >
              {arabic
                ? "إنّ مع الشدة ضياءً من التيسير والفرج."
                : "For indeed, with hardship comes ease."}
            </p>
          </blockquote>
          <Link
            href="/reader/94"
            className={cn(
              "group flex items-center justify-between border-t border-line pt-4 text-sm font-medium",
              arabic && "arabic text-base",
            )}
          >
            <span>{arabic ? "اقرأ السورة" : "Read the surah"}</span>
            <ArrowUpRight
              className={cn(
                "size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent",
                arabic && "-rotate-90 group-hover:-translate-x-0.5",
              )}
            />
          </Link>
        </div>
      </section>

      <section className="grid gap-10 py-16 lg:grid-cols-[.42fr_1fr] lg:gap-20 lg:py-20">
        <div>
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[.16em] text-accent",
              arabic && "arabic text-base tracking-normal",
            )}
          >
            {arabic ? "مساحتك" : "Your space"}
          </p>
          <h2
            className={cn(
              "editorial mt-3 text-3xl tracking-[-.03em] sm:text-4xl",
              arabic && "arabic text-3xl leading-[1.7] tracking-normal",
            )}
          >
            {arabic ? "تابع يومك بهدوء." : "Continue your day, gently."}
          </h2>
          <p
            className={cn(
              "mt-4 max-w-sm text-sm leading-6 text-muted",
              arabic && "arabic text-base leading-[1.9]",
            )}
          >
            {arabic
              ? "موضع القراءة والتأملات والاستماع الأخير، من دون لوحات مزدحمة."
              : "Your reading place, reflections, and recent listening—without a crowded dashboard."}
          </p>
        </div>

        <div className="border-t border-line">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group grid grid-cols-[42px_1fr_auto] items-center gap-4 border-b border-line py-5 transition-colors hover:bg-sand/45 sm:gap-6 sm:px-3"
              >
                <span className="grid size-10 place-items-center rounded-full border border-line text-accent transition-colors group-hover:border-accent/40 group-hover:bg-panel">
                  <Icon className="size-4" strokeWidth={1.7} />
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block text-[11px] font-semibold uppercase tracking-[.13em] text-muted",
                      arabic && "arabic text-sm tracking-normal",
                    )}
                  >
                    {arabic ? item.arabicEyebrow : item.eyebrow}
                  </span>
                  <span
                    className={cn(
                      "mt-1 block truncate text-[15px] font-medium",
                      arabic && "arabic text-lg",
                    )}
                  >
                    {arabic ? item.arabicTitle : item.title}
                  </span>
                  <span
                    className={cn(
                      "mt-0.5 block truncate text-xs text-muted",
                      arabic && "arabic text-sm",
                    )}
                  >
                    {arabic ? item.arabicMeta : item.meta}
                  </span>
                </span>
                <ArrowRight
                  className={cn(
                    "size-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent",
                    arabic && "rotate-180 group-hover:-translate-x-1",
                  )}
                />
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-8 border-y border-line py-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p
            className={cn(
              "text-xs font-semibold uppercase tracking-[.16em] text-accent",
              arabic && "arabic text-base tracking-normal",
            )}
          >
            {arabic ? "استكشف حسب الموضوع" : "Explore by theme"}
          </p>
          <div className="mt-5 flex flex-wrap gap-x-7 gap-y-3">
            {topics.map((topic) => {
              const label = arabic ? topic.arabic : topic.english;
              return (
                <Link
                  key={topic.english}
                  href={`/search?q=${encodeURIComponent(label)}`}
                  className={cn(
                    "border-b border-transparent pb-1 text-sm text-muted transition-colors hover:border-accent hover:text-ink",
                    arabic && "arabic text-base",
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
        <Link
          href="/study"
          className="group flex max-w-sm items-center gap-4 border-l border-line pl-6"
        >
          <Target className="size-5 shrink-0 text-accent" strokeWidth={1.7} />
          <span>
            <span
              className={cn(
                "block text-sm font-medium",
                arabic && "arabic text-lg",
              )}
            >
              {arabic ? "حدد هدفًا للقراءة" : "Set a reading goal"}
            </span>
            <span
              className={cn(
                "mt-1 block text-xs text-muted",
                arabic && "arabic text-sm",
              )}
            >
              {arabic ? "بالسورة أو الصفحة أو الجزء" : "By surah, page, or juz"}
            </span>
          </span>
          <ArrowRight
            className={cn(
              "ml-auto size-4 text-muted transition-transform group-hover:translate-x-1",
              arabic && "mr-auto rotate-180 group-hover:-translate-x-1",
            )}
          />
        </Link>
      </section>
    </div>
  );
}
