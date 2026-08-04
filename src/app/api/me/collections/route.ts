import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isResponse, requireUserId } from '@/lib/api-auth';
import { db } from '@/lib/db';
const schema = z.object({ name: z.string().trim().min(1).max(80), description: z.string().trim().max(280).optional() });
export async function GET() { const userId = await requireUserId(); if (isResponse(userId)) return userId; return NextResponse.json({ data: await db.collection.findMany({ where: { userId }, include: { _count: { select: { items: true } } }, orderBy: { updatedAt: 'desc' } }) }); }
export async function POST(request: NextRequest) { const userId = await requireUserId(); if (isResponse(userId)) return userId; const body = schema.safeParse(await request.json()); if (!body.success) return NextResponse.json({ error: 'Invalid collection payload.' }, { status: 400 }); try { return NextResponse.json({ data: await db.collection.create({ data: { userId, ...body.data } }) }, { status: 201 }); } catch { return NextResponse.json({ error: 'A collection with this name already exists.' }, { status: 409 }); } }
