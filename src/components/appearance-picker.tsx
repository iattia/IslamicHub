"use client";

import { Monitor, Moon, Palette, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import type { ContentLanguage } from "@/components/content-language-provider";
import { cn } from "@/lib/utils";

const themes = [
  { value: "system", icon: Monitor, en: "System", ar: "النظام" },
  { value: "light", icon: Sun, en: "Light", ar: "فاتح" },
  { value: "beige", icon: Palette, en: "Beige", ar: "بيج" },
  { value: "dark", icon: Moon, en: "Dark", ar: "داكن" },
] as const;

export function AppearancePicker({
  language = "en",
}: {
  language?: ContentLanguage;
}) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className="grid grid-cols-2 gap-2"
      role="group"
      aria-label={language === "ar" ? "اختيار المظهر" : "Choose appearance"}
    >
      {themes.map(({ value, icon: Icon, en, ar }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs transition",
            (theme ?? "system") === value
              ? "border-accent bg-sand text-ink"
              : "border-line text-muted hover:border-accent",
          )}
          aria-pressed={(theme ?? "system") === value}
        >
          <Icon className="size-4" /> {language === "ar" ? ar : en}
        </button>
      ))}
    </div>
  );
}
