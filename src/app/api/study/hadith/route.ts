import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getHadiths, HADITH_COLLECTIONS } from "@/lib/hadith-provider";

export const runtime = "nodejs";
export const maxDuration = 60;

const querySchema = z.object({
  collection: z
    .string()
    .refine((value) => HADITH_COLLECTIONS.some((item) => item.id === value)),
  page: z.coerce.number().int().min(1).max(1000).default(1),
  pageSize: z.coerce.number().int().min(5).max(30).default(12),
  q: z.string().trim().max(120).default(""),
});

export async function GET(request: NextRequest) {
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  if (!parsed.success)
    return NextResponse.json(
      { error: "Invalid Hadith request." },
      { status: 400 },
    );
  try {
    const data = await getHadiths(
      parsed.data.collection,
      parsed.data.page,
      parsed.data.pageSize,
      parsed.data.q,
    );
    return NextResponse.json(
      { data },
      {
        headers: {
          "cache-control":
            "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch {
    return NextResponse.json(
      { error: "The Hadith source is temporarily unavailable." },
      { status: 502 },
    );
  }
}
