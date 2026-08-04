import { NextResponse } from 'next/server';
import { listSurahs } from '@/lib/quran-provider';
export const revalidate = 3600;
export async function GET() { try { return NextResponse.json({ data: await listSurahs() }, { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } }); } catch { return NextResponse.json({ error: 'Content service unavailable.' }, { status: 503 }); } }
