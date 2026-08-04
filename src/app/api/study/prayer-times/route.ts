import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getPrayerTimes } from "@/lib/prayer-provider";

const schema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  method: z.coerce.number().int().min(0).max(99).default(2),
  school: z.coerce
    .number()
    .int()
    .refine((value) => value === 0 || value === 1)
    .transform((value) => value as 0 | 1)
    .default(0),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function GET(request: NextRequest) {
  const parsed = schema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid prayer-time request." },
      { status: 400 },
    );
  try {
    const data = await getPrayerTimes(
      parsed.data.lat,
      parsed.data.lng,
      parsed.data.method,
      parsed.data.school,
      parsed.data.date,
    );
    return NextResponse.json(
      { data },
      {
        headers: {
          "cache-control":
            "public, s-maxage=21600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "Prayer times are temporarily unavailable." },
      { status: 502 },
    );
  }
}
