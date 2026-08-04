"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type ContentLanguage = "en" | "ar";

type StoredLanguage = {
  value: ContentLanguage;
  showTranslation: boolean;
  updatedAt: string;
};

type ContentLanguageContextValue = {
  language: ContentLanguage;
  setLanguage: (language: ContentLanguage) => void;
  showTranslation: boolean;
  setShowTranslation: (show: boolean) => void;
  ready: boolean;
};

const STORAGE_KEY = "islamichub:content-language";
const fallback: StoredLanguage = {
  value: "en",
  showTranslation: false,
  updatedAt: new Date(0).toISOString(),
};

const ContentLanguageContext = createContext<ContentLanguageContextValue>({
  language: "en",
  setLanguage: () => undefined,
  showTranslation: false,
  setShowTranslation: () => undefined,
  ready: false,
});

function readLocal(): StoredLanguage {
  try {
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "null",
    ) as Partial<StoredLanguage> | null;
    return {
      value: stored?.value === "ar" ? "ar" : "en",
      showTranslation: stored?.showTranslation === true,
      updatedAt:
        typeof stored?.updatedAt === "string"
          ? stored.updatedAt
          : fallback.updatedAt,
    };
  } catch {
    return fallback;
  }
}

function writeLocal(preference: StoredLanguage) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preference));
  } catch {
    /* Browsing can continue when storage is unavailable. */
  }
}

export function ContentLanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [preference, setPreference] = useState<StoredLanguage>(fallback);
  const [ready, setReady] = useState(false);
  const [account, setAccount] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const local = readLocal();
    setPreference(local);

    fetch("/api/me/preferences")
      .then(async (response) => {
        if (cancelled || response.status === 401) return;
        if (!response.ok) throw new Error("Preferences unavailable");
        const remote = (await response.json()).data as {
          contentLanguage?: string;
          showTranslation?: boolean;
          updatedAt?: string;
        } | null;
        setAccount(true);
        if (!remote) return;
        const remotePreference: StoredLanguage = {
          value: remote.contentLanguage === "ar" ? "ar" : "en",
          showTranslation: remote.showTranslation === true,
          updatedAt: remote.updatedAt ?? fallback.updatedAt,
        };
        if (
          Date.parse(remotePreference.updatedAt) > Date.parse(local.updatedAt)
        ) {
          setPreference(remotePreference);
        }
      })
      .catch(() => undefined)
      .finally(() => !cancelled && setReady(true));

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    writeLocal(preference);
    if (!account) return;
    const timeout = window.setTimeout(() => {
      void fetch("/api/me/preferences", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contentLanguage: preference.value,
          showTranslation: preference.showTranslation,
        }),
      });
    }, 500);
    return () => window.clearTimeout(timeout);
  }, [account, preference, ready]);

  const setLanguage = useCallback((language: ContentLanguage) => {
    setPreference((current) => {
      const next = {
        ...current,
        value: language,
        updatedAt: new Date().toISOString(),
      };
      writeLocal(next);
      return next;
    });
  }, []);

  const setShowTranslation = useCallback((show: boolean) => {
    setPreference((current) => {
      const next = {
        ...current,
        showTranslation: show,
        updatedAt: new Date().toISOString(),
      };
      writeLocal(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      language: preference.value,
      setLanguage,
      showTranslation: preference.showTranslation,
      setShowTranslation,
      ready,
    }),
    [
      preference.showTranslation,
      preference.value,
      ready,
      setLanguage,
      setShowTranslation,
    ],
  );

  return (
    <ContentLanguageContext.Provider value={value}>
      {children}
    </ContentLanguageContext.Provider>
  );
}

export function useContentLanguage() {
  return useContext(ContentLanguageContext);
}
