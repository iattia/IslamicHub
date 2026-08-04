import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isResponse, requireUserId } from '@/lib/api-auth';
import { db } from '@/lib/db';

const schema = z.object({ ayahId: z.number().int().positive().optional(), title: z.string().trim().max(140).optional(), body: z.string().trim().min(1).max(20_000) });
export async function GET() { const userId = await requireUserId(); if (isResponse(userId)) return userId; return NextResponse.json({ data: await db.note.findMany({ where: { userId }, orderBy: { updatedAt: 'desc' } }) }); }
export async function POST(request: NextRequest) { const userId = await requireUserId(); if (isResponse(userId)) return userId; const body = schema.safeParse(await request.json()); if (!body.success) return NextResponse.json({ error: 'Invalid note payload.' }, { status: 400 }); return NextResponse.json({ data: await db.note.create({ data: { userId, ...body.data } }) }, { status: 201 }); }
