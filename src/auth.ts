import NextAuth from 'next-auth';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { db } from '@/lib/db';

const providers = process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET ? [GitHub] : [];
export const { handlers, auth, signIn, signOut } = NextAuth({ adapter: PrismaAdapter(db), providers, trustHost: true, pages: { signIn: '/sign-in' } });
