import type { Metadata } from 'next';
import { Reader } from '@/components/reader/reader';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: "IslamicHub" };
export default async function ReaderPage({ params }: { params: Promise<{ surahId: string }> }) { const { surahId } = await params; return <Reader initialSurahId={Number(surahId)} />; }
