import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isResponse, requireUserId } from "@/lib/api-auth";
import { db } from "@/lib/db";
const studyState = z.object({
  version: z.literal(1),
  updatedAt: z.string().datetime(),
  savedHadiths: z.array(z.string().max(80)).max(5000),
  recentHadiths: z.array(z.string().max(80)).max(50),
  azkar: z.object({
    date: z.string().max(12),
    counts: z.record(z.string().max(100), z.number().int().min(0).max(1000)),
  }),
  prayer: z.object({
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    label: z.string().max(120).optional(),
    method: z.number().int().min(0).max(99),
    school: z.union([z.literal(0), z.literal(1)]),
  }),
});
const schema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  contentLanguage: z.enum(["en", "ar"]).optional(),
  showTranslation: z.boolean().optional(),
  translationIds: z.array(z.string()).max(5).optional(),
  fontScale: z.number().min(0.75).max(1.6).optional(),
  lineHeight: z.number().min(1.4).max(2.8).optional(),
  readingWidth: z.enum(["narrow", "comfortable", "wide"]).optional(),
  reducedMotion: z.boolean().optional(),
  highContrast: z.boolean().optional(),
  studyState: studyState.optional(),
});
export async function GET() {
  const userId = await requireUserId();
  if (isResponse(userId)) return userId;
  return NextResponse.json({
    data: await db.userPreference.findUnique({ where: { userId } }),
  });
}
export async function PATCH(request: NextRequest) {
  const userId = await requireUserId();
  if (isResponse(userId)) return userId;
  const body = schema.safeParse(await request.json());
  if (!body.success)
    return NextResponse.json(
      { error: "Invalid preference payload." },
      { status: 400 },
    );
  return NextResponse.json({
    data: await db.userPreference.upsert({
      where: { userId },
      update: body.data,
      create: { userId, ...body.data },
    }),
  });
}
