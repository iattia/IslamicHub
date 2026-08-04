import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSurah } from '@/lib/quran-provider';

const paramsSchema = z.coerce.number().int().min(1).max(114);
export async function GET(request: NextRequest, { params }: { params: Promise<{ surahId: string }> }) {
  const result = paramsSchema.safeParse((await params).surahId);
  if (!result.success) return NextResponse.json({ error: 'Surah must be between 1 and 114.' }, { status: 400 });
  const translations = request.nextUrl.searchParams.get('translations')?.split(',').filter(Boolean) ?? ['en.sahih'];
  try { return NextResponse.json({ data: await getSurah(result.data, translations) }, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }); }
  catch { return NextResponse.json({ error: 'Content service unavailable.' }, { status: 503 }); }
}
