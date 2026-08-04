import type { Metadata } from "next";
import { Amiri, Noto_Naskh_Arabic } from "next/font/google";
import { Providers } from "@/components/providers";
import { PwaRegistration } from "@/components/pwa-registration";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";
import "./tajweed.css";

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "600"],
  variable: "--font-naskh-arabic",
  display: "swap",
});

const amiri = Amiri({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-amiri",
  display: "swap",
});

const vercelHost =
  process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const applicationUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");
const authEnabled = Boolean(
  process.env.DATABASE_URL &&
  process.env.AUTH_SECRET &&
  process.env.AUTH_GITHUB_ID &&
  process.env.AUTH_GITHUB_SECRET,
);

export const metadata: Metadata = {
  title: "IslamicHub",
  description:
    "A calm, accessible space to read, listen to, and study the Quran.",
  metadataBase: new URL(applicationUrl),
  openGraph: {
    type: "website",
    title: "IslamicHub",
    description: "Read, listen to, and study the Quran.",
  },
  robots: { index: true, follow: true },
};
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${notoNaskhArabic.variable} ${amiri.variable}`}>
        <Providers>
          <PwaRegistration />
          <SiteHeader authEnabled={authEnabled} />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}
