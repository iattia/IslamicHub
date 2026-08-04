"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Compass,
  LocateFixed,
  MapPin,
  Navigation,
  Sunrise,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useContentLanguage } from "@/components/content-language-provider";
import { StorageStatus } from "@/components/study/storage-status";
import { Button } from "@/components/ui/button";
import { useStudyState } from "@/lib/use-study-state";
import { cn } from "@/lib/utils";
import type { PrayerTimes } from "@/types/study";

const METHODS = [
  { id: 2, name: "ISNA — North America", arabicName: "إسنا — أمريكا الشمالية" },
  { id: 3, name: "Muslim World League", arabicName: "رابطة العالم الإسلامي" },
  { id: 4, name: "Umm Al-Qura, Makkah", arabicName: "أم القرى، مكة المكرمة" },
  { id: 5, name: "Egyptian Survey Authority", arabicName: "الهيئة المصرية العامة للمساحة" },
  { id: 1, name: "University of Islamic Sciences, Karachi", arabicName: "جامعة العلوم الإسلامية، كراتشي" },
  { id: 13, name: "Diyanet, Türkiye", arabicName: "رئاسة الشؤون الدينية، تركيا" },
  { id: 17, name: "JAKIM, Malaysia", arabicName: "جاكيم، ماليزيا" },
];
const PRAYERS = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;
const ARABIC_PRAYER_NAMES: Record<(typeof PRAYERS)[number], string> = {
  Fajr: "الفجر",
  Sunrise: "الشروق",
  Dhuhr: "الظهر",
  Asr: "العصر",
  Maghrib: "المغرب",
  Isha: "العشاء",
};

function localDate() {
  return new Date().toLocaleDateString("en-CA");
}

export default function PrayerTimesPage() {
  const { language } = useContentLanguage();
  const arabic = language === "ar";
  const t = (english: string, arabicText: string) =>
    arabic ? arabicText : english;
  const { state, update, ready, storage } = useStudyState();
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [locationError, setLocationError] = useState("");
  const [locating, setLocating] = useState(false);
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    if (!ready) return;
    setLatitude(state.prayer.latitude?.toFixed(4) ?? "");
    setLongitude(state.prayer.longitude?.toFixed(4) ?? "");
  }, [ready, state.prayer.latitude, state.prayer.longitude]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const lat = state.prayer.latitude;
  const lng = state.prayer.longitude;
  const prayers = useQuery({
    queryKey: [
      "prayer-times",
      lat,
      lng,
      state.prayer.method,
      state.prayer.school,
      localDate(),
    ],
    queryFn: async () => {
      const response = await fetch(
        `/api/study/prayer-times?lat=${lat}&lng=${lng}&method=${state.prayer.method}&school=${state.prayer.school}&date=${localDate()}`,
      );
      if (!response.ok) throw new Error();
      return (await response.json()).data as PrayerTimes;
    },
    enabled: typeof lat === "number" && typeof lng === "number",
    staleTime: 300_000,
  });

  const nextPrayer = useMemo(() => {
    if (!prayers.data) return null;
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return (
      PRAYERS.filter((name) => name !== "Sunrise")
        .map((name) => {
          const [hours, minutes] = prayers
            .data!.timings[name].split(":")
            .map(Number);
          return { name, minutes: hours * 60 + minutes };
        })
        .find((prayer) => prayer.minutes > currentMinutes) ?? {
        name: "Fajr" as const,
        minutes:
          24 * 60 +
          Number(prayers.data.timings.Fajr.slice(0, 2)) * 60 +
          Number(prayers.data.timings.Fajr.slice(3)),
      }
    );
  }, [now, prayers.data]);

  function useLocation() {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError(
        t(
          "Location is not supported by this browser. Enter coordinates below.",
          "هذا المتصفح لا يدعم تحديد الموقع. أدخل الإحداثيات أدناه.",
        ),
      );
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLat = Number(position.coords.latitude.toFixed(4));
        const nextLng = Number(position.coords.longitude.toFixed(4));
        setLatitude(String(nextLat));
        setLongitude(String(nextLng));
        update((current) => ({
          ...current,
          prayer: {
            ...current.prayer,
            latitude: nextLat,
            longitude: nextLng,
            label: arabic ? "الموقع الحالي" : "Current location",
          },
        }));
        setLocating(false);
      },
      () => {
        setLocationError(
          t(
            "Location permission was not granted. You can enter coordinates manually.",
            "لم يتم السماح بالوصول إلى الموقع. يمكنك إدخال الإحداثيات يدويًا.",
          ),
        );
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 600_000 },
    );
  }

  function applyCoordinates() {
    const nextLat = Number(latitude);
    const nextLng = Number(longitude);
    if (
      !Number.isFinite(nextLat) ||
      nextLat < -90 ||
      nextLat > 90 ||
      !Number.isFinite(nextLng) ||
      nextLng < -180 ||
      nextLng > 180
    ) {
      setLocationError(
        t(
          "Enter a valid latitude and longitude.",
          "أدخل خط عرض وخط طول صحيحين.",
        ),
      );
      return;
    }
    setLocationError("");
    update((current) => ({
      ...current,
      prayer: {
        ...current.prayer,
        latitude: nextLat,
        longitude: nextLng,
        label: arabic ? "الإحداثيات المحفوظة" : "Saved coordinates",
      },
    }));
  }

  const locationLabel = arabic
    ? state.prayer.label === "Current location" ||
      state.prayer.label === "الموقع الحالي"
      ? "الموقع الحالي"
      : state.prayer.label === "Saved coordinates" ||
          state.prayer.label === "الإحداثيات المحفوظة"
        ? "الإحداثيات المحفوظة"
        : state.prayer.label ?? "الموقع المحفوظ"
    : state.prayer.label ?? "Saved location";
  const calculationMethod = METHODS.find(
    (method) => method.id === prayers.data?.method.id,
  );

  return (
    <div
      lang={language}
      dir={arabic ? "rtl" : "ltr"}
      className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10"
    >
      <div className="flex justify-end">
        <StorageStatus storage={storage} />
      </div>
      <header className="mt-10 max-w-3xl">
        <p
          className={cn(
            "text-xs font-semibold uppercase tracking-[.16em] text-accent",
            arabic && "arabic text-base tracking-normal",
          )}
        >
          {t("Prayer utilities", "أدوات الصلاة")}
        </p>
        <h1
          className={cn(
            "mt-2 text-4xl font-semibold tracking-tight sm:text-5xl",
            arabic && "arabic leading-[1.5] tracking-normal",
          )}
        >
          {t("Your day, oriented around Salah.", "يومك منظم حول الصلاة.")}
        </h1>
        <p className={cn("mt-4 leading-7 text-muted", arabic && "arabic text-lg leading-[1.9]")}>
          {t(
            "Location-based daily prayer times, a configurable calculation method, Hijri date, and Qibla bearing.",
            "مواقيت الصلاة اليومية حسب موقعك، مع طريقة حساب قابلة للتخصيص والتاريخ الهجري واتجاه القبلة.",
          )}
        </p>
      </header>

      <section className="mt-8 grid gap-4 rounded-3xl border border-line bg-panel p-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className={cn("text-sm font-semibold", arabic && "arabic text-lg")}>
            {t("Prayer location", "موقع الصلاة")}
          </p>
          <p className="mt-1 text-xs text-muted">
            {t(
              "Coordinates stay in your local cache, or your account preferences when signed in.",
              "تبقى الإحداثيات في الحفظ المحلي، أو ضمن تفضيلات حسابك عند تسجيل الدخول.",
            )}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <label className="text-xs text-muted">
              {t("Latitude", "خط العرض")}
              <input
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                inputMode="decimal"
                placeholder="40.7128"
                className="mt-1 h-10 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
            <label className="text-xs text-muted">
              {t("Longitude", "خط الطول")}
              <input
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                inputMode="decimal"
                placeholder="-74.0060"
                className="mt-1 h-10 w-full rounded-xl border border-line bg-canvas px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent"
              />
            </label>
          </div>
          {locationError && (
            <p
              role="alert"
              className="mt-2 text-xs text-red-600 dark:text-red-300"
            >
              {locationError}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={applyCoordinates}>
            <MapPin className="size-4" /> {t("Apply", "تطبيق")}
          </Button>
          <Button onClick={useLocation} disabled={locating}>
            <LocateFixed className="size-4" />{" "}
            {locating
              ? t("Locating…", "جارٍ تحديد الموقع…")
              : t("Use my location", "استخدام موقعي")}
          </Button>
        </div>
      </section>

      {typeof lat !== "number" || typeof lng !== "number" ? (
        <div className="mt-6 rounded-3xl border border-dashed border-line p-10 text-center">
          <Navigation className="mx-auto size-7 text-accent" />
          <h2 className="mt-5 text-xl font-semibold">
            {t("Choose a location to begin.", "اختر موقعًا للبدء.")}
          </h2>
          <p className="mx-auto mt-2 max-w-md leading-7 text-muted">
            {t(
              "Use approximate device location or enter coordinates manually. IslamicHub does not request continuous location access.",
              "استخدم الموقع التقريبي للجهاز أو أدخل الإحداثيات يدويًا. لا يطلب إسلامك هَب الوصول المستمر إلى موقعك.",
            )}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <label className="text-xs text-muted">
              {t("Calculation method", "طريقة الحساب")}
              <select
                value={state.prayer.method}
                onChange={(event) =>
                  update((current) => ({
                    ...current,
                    prayer: {
                      ...current.prayer,
                      method: Number(event.target.value),
                    },
                  }))
                }
                className="ml-2 h-10 rounded-xl border border-line bg-panel px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent"
              >
                {METHODS.map((method) => (
                  <option key={method.id} value={method.id}>
                    {arabic ? method.arabicName : method.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs text-muted">
              {t("Asr method", "طريقة حساب العصر")}
              <select
                value={state.prayer.school}
                onChange={(event) =>
                  update((current) => ({
                    ...current,
                    prayer: {
                      ...current.prayer,
                      school: Number(event.target.value) as 0 | 1,
                    },
                  }))
                }
                className="ml-2 h-10 rounded-xl border border-line bg-panel px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-accent"
              >
                <option value={0}>{t("Standard", "قياسي")}</option>
                <option value={1}>{t("Hanafi", "حنفي")}</option>
              </select>
            </label>
          </div>
          {prayers.isLoading && (
            <div className="mt-6 h-72 animate-pulse rounded-3xl border border-line bg-panel" />
          )}
          {prayers.isError && (
            <div
              role="alert"
              className="mt-6 rounded-3xl border border-line bg-panel p-8"
            >
              <h2 className="font-semibold">
                {t("Prayer times could not be loaded.", "تعذّر تحميل مواقيت الصلاة.")}
              </h2>
              <p className="mt-2 text-sm text-muted">
                {t(
                  "Check your connection or try another calculation method.",
                  "تحقق من اتصالك أو جرّب طريقة حساب أخرى.",
                )}
              </p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => prayers.refetch()}
              >
                {t("Try again", "إعادة المحاولة")}
              </Button>
            </div>
          )}
          {prayers.data && (
            <>
              <section className="mt-6 overflow-hidden rounded-3xl border border-line bg-panel">
                <div className="flex flex-col justify-between gap-5 bg-sand/55 p-6 sm:flex-row sm:items-end">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[.14em] text-accent">
                      {locationLabel}
                      {!arabic && ` · ${prayers.data.timezone}`}
                    </p>
                    <h2
                      className={cn(
                        "mt-2 text-2xl font-semibold",
                        arabic && "arabic text-3xl leading-[1.6]",
                      )}
                    >
                      {arabic
                        ? new Intl.DateTimeFormat("ar-EG", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          }).format(now)
                        : prayers.data.date.readable}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      {arabic
                        ? `${new Intl.DateTimeFormat("ar-EG", { weekday: "long" }).format(now)}، ${prayers.data.date.hijri} هـ`
                        : `${prayers.data.date.weekday}, ${prayers.data.date.hijri} AH`}
                    </p>
                  </div>
                  {nextPrayer && (
                    <div className="rounded-2xl bg-panel px-5 py-3">
                      <p className="text-xs text-muted">
                        {t("Next prayer", "الصلاة التالية")}
                      </p>
                      <p className="mt-1 font-semibold">
                        {arabic
                          ? ARABIC_PRAYER_NAMES[nextPrayer.name]
                          : nextPrayer.name}{" "}
                        ·{" "}
                        {Math.max(
                          0,
                          Math.floor(
                            (nextPrayer.minutes -
                              (now.getHours() * 60 + now.getMinutes())) /
                              60,
                          ),
                        )}
                        {t("h", "س")} {" "}
                        {Math.max(
                          0,
                          (nextPrayer.minutes -
                            (now.getHours() * 60 + now.getMinutes())) %
                            60,
                        )}
                        {t("m", "د")}
                      </p>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 divide-x divide-y divide-line sm:grid-cols-3 lg:grid-cols-6">
                  {PRAYERS.map((name) => (
                    <div key={name} className="p-5">
                      <div className="flex items-center gap-2 text-xs text-muted">
                        {name === "Sunrise" && <Sunrise className="size-3.5" />}
                        {arabic ? ARABIC_PRAYER_NAMES[name] : name}
                      </div>
                      <p className="mt-3 text-2xl font-semibold tabular-nums">
                        {prayers.data.timings[name]}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              <section className="mt-5 grid gap-4 rounded-3xl border border-line bg-panel p-6 md:grid-cols-[auto_1fr] md:items-center">
                <div className="relative grid size-36 place-items-center rounded-full border border-line bg-sand/40">
                  <span className="absolute top-2 text-[10px] font-semibold text-muted">
                    {arabic ? "ش" : "N"}
                  </span>
                  <div
                    className="text-accent transition-transform"
                    style={{ transform: `rotate(${prayers.data.qibla}deg)` }}
                  >
                    <Navigation className="size-12 fill-current" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-accent">
                    <Compass className="size-4" />
                    <span className="text-xs font-semibold uppercase tracking-[.14em]">
                      {t("Qibla direction", "اتجاه القبلة")}
                    </span>
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold">
                    {arabic
                      ? `${prayers.data.qibla}° من الشمال الحقيقي`
                      : `${prayers.data.qibla}° from true north`}
                  </h2>
                  <p className="mt-2 max-w-xl leading-7 text-muted">
                    {t(
                      "Use this bearing with a calibrated compass. Nearby metal, electronics, and magnetic declination can affect a device compass.",
                      "استخدم هذا الاتجاه مع بوصلة مُعايرة. قد تؤثر المعادن والأجهزة الإلكترونية القريبة والانحراف المغناطيسي في بوصلة الجهاز.",
                    )}
                  </p>
                </div>
              </section>
              <p className="mt-4 text-xs leading-5 text-muted">
                {arabic
                  ? `حُسبت المواقيت وفق طريقة ${calculationMethod?.arabicName ?? "الحساب المحددة"}. قد تطبق المساجد المحلية تعديلات أو طريقة معتمدة مختلفة؛ اتبع الجهة المحلية الموثوقة عند اختلاف الجداول.`
                  : `Times are calculated using ${prayers.data.method.name}. Local mosques may apply adjustments or a different recognized method; follow your trusted local authority where schedules differ.`}
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}
