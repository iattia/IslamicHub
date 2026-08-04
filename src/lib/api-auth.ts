import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireUserId(): Promise<string | NextResponse> {
  if (!process.env.AUTH_SECRET)
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  const session = await auth();
  const userId = session?.user?.id;
  return (
    userId ??
    NextResponse.json({ error: "Authentication required." }, { status: 401 })
  );
}
export function isResponse(
  value: string | NextResponse,
): value is NextResponse {
  return typeof value !== "string";
}
