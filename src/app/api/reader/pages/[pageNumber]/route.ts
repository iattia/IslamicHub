import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMushafPage } from '@/lib/quran-provider';

const pageSchema = z.coerce.number().int().min(1).max(604);
export async function GET(_: Request, { params }: { params: Promise<{ pageNumber: string }> }) {
  const page = pageSchema.safeParse((await params).pageNumber);
  if (!page.success) return NextResponse.json({ error: 'Mushaf page must be between 1 and 604.' }, { status: 400 });
  try { return NextResponse.json({ data: await getMushafPage(page.data) }, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800' } }); }
  catch { return NextResponse.json({ error: 'Mushaf page is temporarily unavailable.' }, { status: 503 }); }
}
