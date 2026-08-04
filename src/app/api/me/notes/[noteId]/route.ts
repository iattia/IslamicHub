import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isResponse, requireUserId } from '@/lib/api-auth';
import { db } from '@/lib/db';
const schema = z.object({ title: z.string().trim().max(140).nullable().optional(), body: z.string().trim().min(1).max(20_000).optional() });
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ noteId: string }> }) { const userId = await requireUserId(); if (isResponse(userId)) return userId; const body = schema.safeParse(await request.json()); if (!body.success) return NextResponse.json({ error: 'Invalid note payload.' }, { status: 400 }); const { noteId } = await params; const result = await db.note.updateMany({ where: { id: noteId, userId }, data: body.data }); if (!result.count) return NextResponse.json({ error: 'Note not found.' }, { status: 404 }); return NextResponse.json({ data: await db.note.findUniqueOrThrow({ where: { id: noteId } }) }); }
export async function DELETE(_: NextRequest, { params }: { params: Promise<{ noteId: string }> }) { const userId = await requireUserId(); if (isResponse(userId)) return userId; const { noteId } = await params; await db.note.deleteMany({ where: { id: noteId, userId } }); return new NextResponse(null, { status: 204 }); }
