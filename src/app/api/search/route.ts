import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { globalSearch } from '@/lib/search-service';

const schema = z.object({ q: z.string().trim().min(2).max(100), translation: z.string().optional() });
export async function GET(request: NextRequest) {
  const input = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!input.success) return NextResponse.json({ error: 'Use a search query between 2 and 100 characters.' }, { status: 400 });
  try { return NextResponse.json({ data: await globalSearch(input.data.q, input.data.translation) }); }
  catch { return NextResponse.json({ error: 'Search is temporarily unavailable.' }, { status: 503 }); }
}
