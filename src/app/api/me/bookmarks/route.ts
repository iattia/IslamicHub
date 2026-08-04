import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isResponse, requireUserId } from '@/lib/api-auth';
import { db } from '@/lib/db';

const createSchema = z.object({ ayahId: z.number().int().positive(), folder: z.string().trim().max(80).optional(), tags: z.array(z.string().trim().min(1).max(30)).max(10).default([]) });
export async function GET() { const userId = await requireUserId(); if (isResponse(userId)) return userId; const data = await db.bookmark.findMany({ where: { userId }, include: { ayah: { include: { surah: true } } }, orderBy: { createdAt: 'desc' } }); return NextResponse.json({ data }); }
export async function POST(request: NextRequest) { const userId = await requireUserId(); if (isResponse(userId)) return userId; const body = createSchema.safeParse(await request.json()); if (!body.success) return NextResponse.json({ error: 'Invalid bookmark payload.' }, { status: 400 }); const data = await db.bookmark.upsert({ where: { userId_ayahId: { userId, ayahId: body.data.ayahId } }, update: { folder: body.data.folder, tags: body.data.tags }, create: { userId, ...body.data } }); return NextResponse.json({ data }, { status: 201 }); }
export async function DELETE(request: NextRequest) { const userId = await requireUserId(); if (isResponse(userId)) return userId; const ayahId = z.coerce.number().int().positive().safeParse(request.nextUrl.searchParams.get('ayahId')); if (!ayahId.success) return NextResponse.json({ error: 'Invalid ayah id.' }, { status: 400 }); await db.bookmark.deleteMany({ where: { userId, ayahId: ayahId.data } }); return new NextResponse(null, { status: 204 }); }
