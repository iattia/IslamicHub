"use client";

import Link from "next/link";
import { BookOpen, Check, Search, Settings2, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AppearancePicker } from "@/components/appearance-picker";
import { useContentLanguage } from "@/components/content-language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const primaryLinks = [
  {
    href: "/reader/1",
    label: "Quran",
    arabicLabel: "القرآن",
    match: "/reader",
  },
  {
    href: "/study/hadith",
    label: "Hadith",
    arabicLabel: "الحديث",
    match: "/study/hadith",
  },
  {
    href: "/study/azkaar",
    label: "Azkaar",
    arabicLabel: "الأذكار",
    match: "/study/azkaar",
  },
  {
    href: "/study/prayer-times",
    label: "Prayer",
    arabicLabel: "الصلاة",
    match: "/study/prayer-times",
  },
  {
    href: "/collections",
    label: "Collections",
    arabicLabel: "المجموعات",
    match: "/collections",
  },
];

export function SiteHeader({ authEnabled }: { authEnabled: boolean }) {
  const { language, setLanguage, showTranslation, setShowTranslation } =
    useContentLanguage();
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => setSettingsOpen(false), [pathname]);
  useEffect(() => {
    if (!settingsOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSettingsOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [settingsOpen]);
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-canvas/90 backdrop-blur-xl">
      <div className="mx-auto grid h-16 max-w-[90rem] grid-cols-[1fr_auto] items-center px-4 sm:px-6 md:grid-cols-[1fr_auto_1fr]">
        <Link
          href="/"
          className="group flex w-fit items-center gap-2.5 text-[15px] font-semibold tracking-tight"
        >
          <span
            className="relative grid size-9 place-items-center"
            aria-hidden="true"
          >
            <span className="absolute inset-x-1 top-0 h-7 rounded-t-full border border-accent/70 transition-colors group-hover:bg-sand" />
            <BookOpen
              className="relative mt-3 size-4 text-accent"
              strokeWidth={1.7}
            />
          </span>
          <span>IslamicHub</span>
        </Link>
        <nav
          aria-label={language === "ar" ? "التنقل الرئيسي" : "Primary"}
          dir={language === "ar" ? "rtl" : "ltr"}
          className="hidden items-center gap-6 text-[13px] text-muted md:flex lg:gap-8"
        >
          {primaryLinks.map((link) => {
            const active = pathname.startsWith(link.match);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-[1.42rem] transition-colors hover:text-ink",
                  active && "font-medium text-ink",
                )}
              >
                <span className={cn(language === "ar" && "arabic text-base")}>
                  {language === "ar" ? link.arabicLabel : link.label}
                </span>
                {active && (
                  <span className="absolute inset-x-0 bottom-0 h-px bg-accent" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center justify-end gap-1">
          <Link
            href="/search"
            aria-label={language === "ar" ? "البحث في القرآن" : "Search Quran"}
          >
            <Button variant="ghost" size="sm">
              <Search className="size-4" />
              <span
                className={cn(
                  "hidden sm:inline",
                  language === "ar" && "arabic text-base",
                )}
              >
                {language === "ar" ? "البحث" : "Search"}
              </span>
            </Button>
          </Link>
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSettingsOpen((open) => !open)}
              aria-label={language === "ar" ? "فتح الإعدادات" : "Open settings"}
              aria-haspopup="dialog"
              aria-expanded={settingsOpen}
            >
              <Settings2 className="size-4" />
              <span
                className={cn(
                  "hidden lg:inline",
                  language === "ar" && "arabic",
                )}
              >
                {language === "ar" ? "الإعدادات" : "Settings"}
              </span>
            </Button>
            {settingsOpen && (
              <div
                role="dialog"
                aria-label={
                  language === "ar" ? "إعدادات التطبيق" : "Application settings"
                }
                lang={language}
                dir={language === "ar" ? "rtl" : "ltr"}
                className="absolute right-0 top-11 w-[min(21rem,calc(100vw-2rem))] rounded-xl border border-line bg-panel p-4 shadow-[0_20px_60px_hsl(var(--ink)/.12)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p
                      className={cn(
                        "font-semibold",
                        language === "ar" && "arabic text-lg",
                      )}
                    >
                      {language === "ar" ? "الإعدادات" : "Settings"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {language === "ar"
                        ? "تتم مزامنة خيارات القراءة عند تسجيل الدخول."
                        : "Reading choices sync when you sign in."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(false)}
                    className="grid size-8 place-items-center rounded-lg text-muted hover:bg-sand hover:text-ink"
                    aria-label={
                      language === "ar" ? "إغلاق الإعدادات" : "Close settings"
                    }
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <section className="mt-5 border-t border-line pt-4">
                  <p className="text-xs font-semibold">
                    {language === "ar" ? "نص القراءة" : "Reading text"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    {language === "ar"
                      ? "استخدم العربية وحدها، أو أضف إليها الترجمة الإنجليزية."
                      : "Use English alone, or pair it with the original Arabic text."}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-2">
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
                          "flex h-10 items-center justify-center gap-2 rounded-xl border text-sm transition",
                          language === value
                            ? "border-accent bg-sand text-ink"
                            : "border-line text-muted hover:border-accent",
                          value === "ar" && "arabic text-base",
                        )}
                        aria-pressed={language === value}
                      >
                        {language === value && <Check className="size-3.5" />}
                        {label}
                      </button>
                    ))}
                  </div>
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
                          ? "تظهر الترجمة الإنجليزية أسفل النص العربي."
                          : "Places the Arabic text above the English translation."}
                      </span>
                    </span>
                  </label>
                </section>

                <section className="mt-4 border-t border-line pt-4">
                  <p className="text-xs font-semibold">
                    {language === "ar" ? "المظهر" : "Appearance"}
                  </p>
                  <div className="mt-3">
                    <AppearancePicker language={language} />
                  </div>
                </section>
              </div>
            )}
          </div>
          {authEnabled ? (
            <Link href="/sign-in">
              <Button variant="secondary" size="sm">
                <span className="hidden lg:inline">
                  {language === "ar" ? "تسجيل الدخول" : "Sign in"}
                </span>
                <span className="lg:hidden">
                  {language === "ar" ? "الحساب" : "Account"}
                </span>
              </Button>
            </Link>
          ) : (
            <span className="hidden px-2 text-[11px] text-muted xl:inline">
              {language === "ar" ? "حفظ محلي" : "Local mode"}
            </span>
          )}
        </div>
      </div>
      <nav
        aria-label={
          language === "ar" ? "التنقل الرئيسي للجوال" : "Primary mobile"
        }
        dir={language === "ar" ? "rtl" : "ltr"}
        className="mx-auto flex max-w-[90rem] gap-5 overflow-x-auto px-4 pb-2 md:hidden [scrollbar-width:none]"
      >
        {primaryLinks.map((link) => {
          const active = pathname.startsWith(link.match);
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "shrink-0 border-b py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-accent text-ink"
                  : "border-transparent text-muted hover:text-ink",
              )}
            >
              <span className={cn(language === "ar" && "arabic text-sm")}>
                {language === "ar" ? link.arabicLabel : link.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
