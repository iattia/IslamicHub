import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "IslamicHub",
  description:
    "Read trusted Hadith collections, maintain daily Azkaar, and view location-based prayer times in IslamicHub.",
};

export default function StudyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
