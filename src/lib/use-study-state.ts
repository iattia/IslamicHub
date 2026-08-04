"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudyState } from "@/types/study";

const STORAGE_KEY = "islamichub:study-state";

function today() {
  return new Date().toLocaleDateString("en-CA");
}

export function createDefaultStudyState(): StudyState {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    savedHadiths: [],
    recentHadiths: [],
    azkar: { date: today(), counts: {} },
    prayer: { method: 2, school: 0 },
  };
}

function normalize(value: Partial<StudyState> | null | undefined): StudyState {
  const fallback = createDefaultStudyState();
  return {
    ...fallback,
    ...value,
    version: 1,
    savedHadiths: Array.isArray(value?.savedHadiths)
      ? value.savedHadiths.slice(0, 5000)
      : [],
    recentHadiths: Array.isArray(value?.recentHadiths)
      ? value.recentHadiths.slice(0, 50)
      : [],
    azkar:
      value?.azkar?.date === today()
        ? value.azkar
        : { date: today(), counts: {} },
    prayer: { ...fallback.prayer, ...value?.prayer },
  };
}

export function useStudyState() {
  const [state, setState] = useState<StudyState>(createDefaultStudyState);
  const [ready, setReady] = useState(false);
  const [storage, setStorage] = useState<"checking" | "local" | "account">(
    "checking",
  );

  useEffect(() => {
    let cancelled = false;
    let local = createDefaultStudyState();
    try {
      local = normalize(
        JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null"),
      );
    } catch {
      local = createDefaultStudyState();
    }
    setState(local);
    fetch("/api/me/preferences")
      .then(async (response) => {
        if (cancelled) return;
        if (response.status === 401) {
          setStorage("local");
          return;
        }
        if (!response.ok) throw new Error("Preferences unavailable");
        const remote = normalize(
          (await response.json()).data?.studyState as
            Partial<StudyState> | undefined,
        );
        const selected =
          Date.parse(remote.updatedAt) > Date.parse(local.updatedAt)
            ? remote
            : local;
        setState(selected);
        setStorage("account");
      })
      .catch(() => !cancelled && setStorage("local"))
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (storage !== "account") return;
    const timeout = window.setTimeout(() => {
      void fetch("/api/me/preferences", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ studyState: state }),
      });
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [ready, state, storage]);

  const update = useCallback(
    (updater: Partial<StudyState> | ((current: StudyState) => StudyState)) => {
      setState((current) => {
        const next =
          typeof updater === "function"
            ? updater(current)
            : { ...current, ...updater };
        return normalize({ ...next, updatedAt: new Date().toISOString() });
      });
    },
    [],
  );

  return { state, update, ready, storage };
}
