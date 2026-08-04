"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Clock3, LayoutGrid, Sparkles } from "lucide-react";
import { useContentLanguage } from "@/components/content-language-provider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/study", label: "Overview", arabicLabel: "نظرة عامة", icon: LayoutGrid },
  { href: "/study/hadith", label: "Hadith", arabicLabel: "الحديث", icon: BookOpenText },
  { href: "/study/azkaar", label: "Azkaar", arabicLabel: "الأذكار", icon: Sparkles },
  { href: "/study/prayer-times", label: "Prayer", arabicLabel: "الصلاة", icon: Clock3 },
];

export function StudyNav() {
  const { language } = useContentLanguage();
  const pathname = usePathname();
  return (
    <nav
      aria-label={language === "ar" ? "مساحة الدراسة" : "Study workspace"}
      dir={language === "ar" ? "rtl" : "ltr"}
      className="flex gap-1 overflow-x-auto rounded-2xl border border-line bg-panel p-1.5 [scrollbar-width:none]"
    >
      {links.map((link) => {
        const active =
          link.href === "/study"
            ? pathname === link.href
            : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
              active
                ? "bg-ink text-canvas"
                : "text-muted hover:bg-sand hover:text-ink",
            )}
          >
            <link.icon className="size-4" />
            <span className={language === "ar" ? "arabic text-base" : undefined}>
              {language === "ar" ? link.arabicLabel : link.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
