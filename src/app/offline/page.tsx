import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function OfflinePage() { return <div className="mx-auto max-w-lg px-4 py-28 text-center"><p className="text-xs font-semibold uppercase tracking-[.16em] text-accent">Offline</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">You’re not connected.</h1><p className="mt-3 text-muted">Previously opened chapters remain available. Reconnect to search or open new content.</p><Link href="/reader/1"><Button className="mt-7">Open Al-Fatihah</Button></Link></div>; }
