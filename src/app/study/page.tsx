"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookMarked,
  BookOpenText,
  Clock3,
  Languages,
  NotebookPen,
  Sparkles,
} from "lucide-react";
import { StorageStatus } from "@/components/study/storage-status";
import { Button } from "@/components/ui/button";
import { AZKAAR } from "@/data/azkaar";
import { useStudyState } from "@/lib/use-study-state";

const modules = [
  {
    href: "/study/hadith",
    icon: BookOpenText,
    eyebrow: "Eight major collections",
    title: "Hadith library",
    body: "Search and read complete Arabic and English narrations from trusted source books.",
    action: "Browse collections",
  },
  {
    href: "/study/azkaar",
    icon: Sparkles,
    eyebrow: "Daily practice",
    title: "Azkaar",
    body: "Morning, evening, after-prayer, and sleep remembrances with clear daily counters.",
    action: "Begin today’s Azkaar",
  },
  {
    href: "/study/prayer-times",
    icon: Clock3,
    eyebrow: "Location based",
    title: "Prayer and Qibla",
    body: "Daily Salah times, calculation-method controls, Hijri date, and Qibla bearing.",
    action: "View today’s schedule",
  },
];

export default function StudyPage() {
  const { state, storage } = useStudyState();
  const azkarItems = AZKAAR.flatMap((category) => category.items);
  const completedAzkar = azkarItems.filter(
    (item) => (state.azkar.counts[item.id] ?? 0) >= item.repetitions,
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex justify-end">
        <StorageStatus storage={storage} />
      </div>
      <header className="mt-12 grid gap-8 overflow-hidden rounded-[2rem] border border-line bg-panel p-7 sm:p-10 lg:grid-cols-[1fr_300px] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-accent">
            Study workspace
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-[-.04em] sm:text-6xl">
            Knowledge, remembrance, and the shape of your day.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            A private, local-first workspace for reading reliable sources and
            maintaining the daily practices you return to.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-sand/60 p-4">
            <p className="text-2xl font-semibold">
              {state.savedHadiths.length}
            </p>
            <p className="mt-1 text-xs text-muted">Saved narrations</p>
          </div>
          <div className="rounded-2xl bg-sand/60 p-4">
            <p className="text-2xl font-semibold">{completedAzkar}</p>
            <p className="mt-1 text-xs text-muted">Azkaar today</p>
          </div>
          <div className="col-span-2 rounded-2xl border border-line p-4">
            <p className="text-xs text-muted">Prayer location</p>
            <p className="mt-1 truncate text-sm font-semibold">
              {state.prayer.label ?? "Not configured"}
            </p>
          </div>
        </div>
      </header>

      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        {modules.map((module) => (
          <Link
            key={module.href}
            href={module.href}
            className="group flex min-h-72 flex-col rounded-3xl border border-line bg-panel p-6 transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg"
          >
            <div className="flex size-11 items-center justify-center rounded-2xl bg-sand text-accent">
              <module.icon className="size-5" />
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[.14em] text-accent">
              {module.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold">{module.title}</h2>
            <p className="mt-3 leading-7 text-muted">{module.body}</p>
            <span className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium">
              {module.action}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>

      <section className="mt-10 rounded-3xl border border-line bg-sand/35 p-6 sm:p-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.16em] text-accent">
            Quran study
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Continue building your Quran workspace.
          </h2>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <Link href="/reader/1" className="rounded-2xl bg-panel p-5">
            <Languages className="size-5 text-accent" />
            <h3 className="mt-5 font-semibold">Translation comparison</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Compare vetted English editions beside the Arabic text.
            </p>
          </Link>
          <Link href="/collections" className="rounded-2xl bg-panel p-5">
            <BookMarked className="size-5 text-accent" />
            <h3 className="mt-5 font-semibold">Verse collections</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Group Quran passages around a lesson, theme, or question.
            </p>
          </Link>
          <Link href="/sign-in" className="rounded-2xl bg-panel p-5">
            <NotebookPen className="size-5 text-accent" />
            <h3 className="mt-5 font-semibold">Private notes</h3>
            <p className="mt-2 text-sm leading-6 text-muted">
              Keep observations synced privately with your account.
            </p>
          </Link>
        </div>
        <Link href="/reader/1">
          <Button className="mt-6">
            Open Quran reader <ArrowRight className="size-4" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
