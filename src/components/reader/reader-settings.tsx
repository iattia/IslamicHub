"use client";

import { Maximize2, Minus, Plus, X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useContentLanguage } from "@/components/content-language-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TAJWEED_LEGEND } from "./tajweed-text";

export type RecitationOption = { value: number; label: string };

type ReaderSettingsProps = {
  open: boolean;
  onClose: () => void;
  fontSize: number;
  onFontSizeChange: (value: number) => void;
  minFontSize?: number;
  tajweed: boolean;
  onTajweedChange: (enabled: boolean) => void;
  recitationOptions: RecitationOption[];
  recitationStart: number;
  recitationEnd: number;
  onRecitationStartChange: (value: number) => void;
  onRecitationEndChange: (value: number) => void;
  repeatCount: number;
  onRepeatCountChange: (value: number) => void;
  viewSettings?: ReactNode;
};

export function ReaderSettings({
  open,
  onClose,
  fontSize,
  onFontSizeChange,
  minFontSize = 18,
  tajweed,
  onTajweedChange,
  recitationOptions,
  recitationStart,
  recitationEnd,
  onRecitationStartChange,
  onRecitationEndChange,
  repeatCount,
  onRepeatCountChange,
  viewSettings,
}: ReaderSettingsProps) {
  const { language } = useContentLanguage();
  const arabic = language === "ar";
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const startOptions = recitationOptions.filter(
    (option) => option.value <= recitationEnd,
  );
  const endOptions = recitationOptions.filter(
    (option) => option.value >= recitationStart,
  );

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 bg-ink/15"
        onClick={onClose}
        aria-label={arabic ? "إغلاق إعدادات القارئ" : "Close reader settings"}
      />
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-line bg-panel shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={arabic ? "إعدادات القارئ" : "Reader settings"}
        lang={language}
        dir={arabic ? "rtl" : "ltr"}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-4">
          <h2 className={cn("font-semibold", arabic && "arabic text-lg")}>
            {arabic ? "إعدادات القارئ" : "Reader settings"}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            aria-label={arabic ? "إغلاق الإعدادات" : "Close settings"}
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 space-y-7 overflow-y-auto p-5">
          {viewSettings}

          <SettingSection
            title={arabic ? "نطاق التلاوة" : "Recitation range"}
            description={
              arabic
                ? "حدّد موضع بداية التشغيل ونهايته بدقة."
                : "Choose exactly where playback begins and ends."
            }
          >
            {recitationOptions.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium text-muted">
                  {arabic ? "البداية" : "Start"}
                  <select
                    value={recitationStart}
                    onChange={(event) =>
                      onRecitationStartChange(Number(event.target.value))
                    }
                    className="mt-1.5 h-10 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent"
                  >
                    {startOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-medium text-muted">
                  {arabic ? "النهاية" : "End"}
                  <select
                    value={recitationEnd}
                    onChange={(event) =>
                      onRecitationEndChange(Number(event.target.value))
                    }
                    className="mt-1.5 h-10 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent"
                  >
                    {endOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : (
              <p className="rounded-xl border border-line bg-canvas p-3 text-xs text-muted">
                {arabic
                  ? "تظهر خيارات التلاوة بعد تحميل نص القرآن."
                  : "Recitation choices will appear when the Quran text has loaded."}
              </p>
            )}
            <label className="mt-3 flex items-center gap-3 rounded-xl border border-line bg-canvas px-3 py-2 text-sm">
              <span className="flex-1">
                {arabic ? "تشغيل النطاق كاملًا" : "Play complete range"}
              </span>
              <input
                type="number"
                min="1"
                max="100"
                value={repeatCount}
                onChange={(event) =>
                  onRepeatCountChange(
                    Math.min(100, Math.max(1, Number(event.target.value) || 1)),
                  )
                }
                className="w-16 rounded-lg border border-line bg-panel px-2 py-1.5 text-center font-medium outline-none focus:ring-2 focus:ring-accent"
                aria-label={
                  arabic
                    ? "عدد مرات تكرار التلاوة"
                    : "Number of recitation repetitions"
                }
              />
              <span className="text-muted">{arabic ? "مرات" : "times"}</span>
            </label>
            <p className="mt-2 text-[11px] leading-5 text-muted">
              {arabic
                ? "مرة واحدة تعني تشغيلًا واحدًا. يبدأ التكرار من الموضع المحدد بعد بلوغ النهاية المحددة."
                : "One time means a single play. Repetition restarts from the selected beginning after the selected ending."}
            </p>
          </SettingSection>

          <SettingSection
            title={arabic ? "حجم النص" : "Text size"}
            description={
              arabic
                ? "يمكن تكبير النص حتى 72 بكسل لقراءة مريحة من مسافة."
                : "Scales up to 72px for comfortable reading at a distance."
            }
          >
            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  onFontSizeChange(Math.max(minFontSize, fontSize - 4))
                }
                aria-label={arabic ? "تصغير نص القرآن" : "Decrease Quran text"}
              >
                <Minus className="size-4" />
              </Button>
              <input
                type="range"
                min={minFontSize}
                max="72"
                step="1"
                value={fontSize}
                onChange={(event) =>
                  onFontSizeChange(Number(event.target.value))
                }
                className="min-w-0 flex-1 accent-current"
                aria-label={arabic ? "حجم نص القرآن" : "Quran text size"}
                aria-valuetext={`${fontSize} ${arabic ? "بكسل" : "pixels"}`}
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onFontSizeChange(Math.min(72, fontSize + 4))}
                aria-label={arabic ? "تكبير نص القرآن" : "Increase Quran text"}
              >
                <Plus className="size-4" />
              </Button>
              <output className="w-10 text-right text-xs tabular-nums text-muted">
                {fontSize}px
              </output>
            </div>
          </SettingSection>

          <SettingSection
            title={arabic ? "ألوان التجويد" : "Tajweed colors"}
            description={
              arabic
                ? "تدعم جميع فئات التجويد السبع عشرة المرمّزة في نسخة النص."
                : "All 17 annotation categories supplied by the Tajweed text edition are supported."
            }
          >
            <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line bg-canvas px-3 py-3 text-sm">
              <span>
                {arabic ? "عرض ألوان التجويد" : "Show Tajweed colors"}
              </span>
              <input
                type="checkbox"
                checked={tajweed}
                onChange={(event) => onTajweedChange(event.target.checked)}
                className="size-4 accent-current"
              />
            </label>
            {tajweed && (
              <div className="mt-3 rounded-xl border border-line p-3">
                <p className="mb-2 text-xs font-semibold">
                  {arabic ? "دليل الألوان" : "Color guide"}
                </p>
                <div className="grid gap-x-3 sm:grid-cols-2">
                  {TAJWEED_LEGEND.map((rule) => (
                    <div
                      key={rule.label}
                      className="flex items-center gap-2 py-1.5 text-xs text-muted"
                    >
                      <span
                        className={cn(
                          "size-2.5 shrink-0 rounded-full bg-current",
                          rule.className,
                        )}
                      />
                      <span>{arabic ? rule.arLabel : rule.label}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 border-t border-line pt-3 text-[11px] leading-5 text-muted">
                  {arabic
                    ? "يعكس هذا الدليل الفئات المرمّزة في النسخة المصدر. ويتضمن علم التجويد تفاصيل في النطق والأداء لا يمكن تمثيلها بالألوان وحدها."
                    : "This guide reflects the source edition's encoded categories. Tajweed study also includes pronunciation and recitation details that cannot be fully represented by color alone."}
                </p>
              </div>
            )}
          </SettingSection>

          <SettingSection
            title={arabic ? "العرض" : "Display"}
            description={
              arabic
                ? "استخدم الشاشة كاملة لقراءة بلا مشتتات."
                : "Use your whole screen for distraction-free reading."
            }
          >
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => document.documentElement.requestFullscreen?.()}
            >
              <Maximize2 className="size-4" />
              {arabic ? "ملء شاشة المتصفح" : "Enter browser fullscreen"}
            </Button>
          </SettingSection>
        </div>
      </aside>
    </>
  );
}

export function SettingSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mb-3 mt-1 text-xs leading-5 text-muted">{description}</p>
      {children}
    </section>
  );
}
