import { Fragment } from "react";
import { cn } from "@/lib/utils";

const RULES = {
  h: {
    className: "tajweed-silent",
    label: "Hamzat ul Wasl",
    arLabel: "همزة الوصل",
  },
  s: {
    className: "tajweed-silent",
    label: "Silent letter",
    arLabel: "حرف غير ملفوظ",
  },
  l: {
    className: "tajweed-silent",
    label: "Laam Shamsiyyah",
    arLabel: "اللام الشمسية",
  },
  n: {
    className: "tajweed-madda-normal",
    label: "Madda Normal",
    arLabel: "المد الطبيعي",
  },
  p: {
    className: "tajweed-madda-permissible",
    label: "Madda Permissible",
    arLabel: "المد الجائز",
  },
  m: {
    className: "tajweed-madda-necessary",
    label: "Madda Necessary",
    arLabel: "المد اللازم",
  },
  q: { className: "tajweed-qalaqah", label: "Qalaqah", arLabel: "القلقلة" },
  o: {
    className: "tajweed-madda-obligatory",
    label: "Madda Obligatory",
    arLabel: "المد الواجب",
  },
  c: {
    className: "tajweed-ikhafa-shafawi",
    label: "Ikhafa Shafawi",
    arLabel: "الإخفاء الشفوي",
  },
  f: { className: "tajweed-ikhafa", label: "Ikhafa", arLabel: "الإخفاء" },
  w: {
    className: "tajweed-idgham-shafawi",
    label: "Idgham Shafawi",
    arLabel: "الإدغام الشفوي",
  },
  i: { className: "tajweed-iqlab", label: "Iqlab", arLabel: "الإقلاب" },
  a: {
    className: "tajweed-idgham-ghunnah",
    label: "Idgham with Ghunnah",
    arLabel: "الإدغام بغنة",
  },
  u: {
    className: "tajweed-idgham-no-ghunnah",
    label: "Idgham without Ghunnah",
    arLabel: "الإدغام بغير غنة",
  },
  d: {
    className: "tajweed-silent",
    label: "Idgham Mutajanisayn",
    arLabel: "إدغام المتجانسين",
  },
  b: {
    className: "tajweed-silent",
    label: "Idgham Mutaqaribayn",
    arLabel: "إدغام المتقاربين",
  },
  g: { className: "tajweed-ghunnah", label: "Ghunnah", arLabel: "الغنة" },
} as const;
type TajweedCode = keyof typeof RULES;
type Segment = { text: string; code?: TajweedCode; key: number };
export function parseTajweed(value: string): Segment[] {
  const segments: Segment[] = [];
  const stack: TajweedCode[] = [];
  let buffer = "";
  let index = 0;
  let key = 0;
  const flush = () => {
    if (!buffer) return;
    segments.push({ text: buffer, code: stack.at(-1), key: key++ });
    buffer = "";
  };
  while (index < value.length) {
    const opener = value.slice(index).match(/^\[([a-z])(?::\d+)?\[/);
    if (opener && opener[1] in RULES) {
      flush();
      stack.push(opener[1] as TajweedCode);
      index += opener[0].length;
      continue;
    }
    if (value[index] === "]" && stack.length) {
      flush();
      stack.pop();
      index += 1;
      continue;
    }
    buffer += value[index];
    index += 1;
  }
  flush();
  return segments;
}
export function stripTajweed(value: string): string {
  return parseTajweed(value)
    .map((segment) => segment.text)
    .join("");
}
export function TajweedText({
  value,
  enabled,
  className,
}: {
  value: string;
  enabled: boolean;
  className?: string;
}) {
  return (
    <span className={className}>
      {parseTajweed(value).map((segment) =>
        segment.code && RULES[segment.code] ? (
          <span
            key={segment.key}
            className={cn(enabled && RULES[segment.code].className)}
            title={enabled ? RULES[segment.code].label : undefined}
          >
            {segment.text}
          </span>
        ) : (
          <Fragment key={segment.key}>{segment.text}</Fragment>
        ),
      )}
    </span>
  );
}
export const TAJWEED_LEGEND = Object.values(RULES);
