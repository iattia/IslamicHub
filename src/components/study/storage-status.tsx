"use client";

import { Cloud, HardDrive, LoaderCircle } from "lucide-react";
import { useContentLanguage } from "@/components/content-language-provider";

export function StorageStatus({
  storage,
}: {
  storage: "checking" | "local" | "account";
}) {
  const { language } = useContentLanguage();
  const arabic = language === "ar";
  const content =
    storage === "account"
      ? {
          icon: Cloud,
          label: arabic ? "مزامنة الحساب" : "Account sync",
          detail: arabic ? "محفوظ على أجهزتك" : "Saved across devices",
        }
      : storage === "local"
        ? {
            icon: HardDrive,
            label: arabic ? "حفظ محلي" : "Local cache",
            detail: arabic ? "محفوظ على هذا الجهاز" : "Stored on this device",
          }
        : {
            icon: LoaderCircle,
            label: arabic ? "جارٍ فحص الحفظ" : "Checking storage",
            detail: arabic ? "جارٍ إعداد مساحة الدراسة" : "Preparing your workspace",
          };
  return (
    <div
      className="flex items-center gap-2 rounded-full border border-line bg-panel px-3 py-1.5 text-xs text-muted"
      title={content.detail}
      lang={language}
      dir={arabic ? "rtl" : "ltr"}
    >
      <content.icon
        className={
          storage === "checking" ? "size-3.5 animate-spin" : "size-3.5"
        }
      />
      <span className={arabic ? "arabic text-sm" : undefined}>{content.label}</span>
    </div>
  );
}
