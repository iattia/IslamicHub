import { cached } from "@/lib/cache";
import type { PrayerTimes } from "@/types/study";

type AladhanResponse = {
  code: number;
  data: {
    timings: Record<string, string>;
    date: {
      readable: string;
      hijri: { date: string; weekday: { en: string } };
    };
    meta: { timezone: string; method: { id: number; name: string } };
  };
};

function cleanTime(value: string) {
  return value.replace(/\s*\(.+\)$/, "");
}

export function qiblaBearing(latitude: number, longitude: number) {
  const kaabaLatitude = (21.4225 * Math.PI) / 180;
  const longitudeDelta = ((39.8262 - longitude) * Math.PI) / 180;
  const latitudeRadians = (latitude * Math.PI) / 180;
  const y = Math.sin(longitudeDelta);
  const x =
    Math.cos(latitudeRadians) * Math.tan(kaabaLatitude) -
    Math.sin(latitudeRadians) * Math.cos(longitudeDelta);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

export async function getPrayerTimes(
  latitude: number,
  longitude: number,
  method: number,
  school: 0 | 1,
  date: string,
): Promise<PrayerTimes> {
  const roundedLatitude = Number(latitude.toFixed(4));
  const roundedLongitude = Number(longitude.toFixed(4));
  return cached(
    `prayer:${roundedLatitude}:${roundedLongitude}:${method}:${school}:${date}`,
    21_600,
    async () => {
      const timestamp = Math.floor(
        new Date(`${date}T12:00:00Z`).getTime() / 1000,
      );
      const params = new URLSearchParams({
        latitude: String(roundedLatitude),
        longitude: String(roundedLongitude),
        method: String(method),
        school: String(school),
      });
      const response = await fetch(
        `https://api.aladhan.com/v1/timings/${timestamp}?${params}`,
        { next: { revalidate: 21_600 } },
      );
      if (!response.ok) throw new Error("Prayer provider unavailable");
      const payload = (await response.json()) as AladhanResponse;
      if (payload.code !== 200)
        throw new Error("Prayer provider rejected location");
      const { data } = payload;
      return {
        date: {
          readable: data.date.readable,
          hijri: data.date.hijri.date,
          weekday: data.date.hijri.weekday.en,
        },
        timings: {
          Fajr: cleanTime(data.timings.Fajr),
          Sunrise: cleanTime(data.timings.Sunrise),
          Dhuhr: cleanTime(data.timings.Dhuhr),
          Asr: cleanTime(data.timings.Asr),
          Maghrib: cleanTime(data.timings.Maghrib),
          Isha: cleanTime(data.timings.Isha),
        },
        method: { id: data.meta.method.id, name: data.meta.method.name },
        timezone: data.meta.timezone,
        qibla: Number(qiblaBearing(latitude, longitude).toFixed(1)),
      };
    },
  );
}
