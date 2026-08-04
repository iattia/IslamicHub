import { NextResponse } from "next/server";
import { HADITH_COLLECTIONS } from "@/lib/hadith-provider";

export async function GET() {
  return NextResponse.json(
    { data: HADITH_COLLECTIONS },
    {
      headers: {
        "cache-control":
          "public, s-maxage=86400, stale-while-revalidate=604800",
      },
    },
  );
}
