import { NextRequest, NextResponse } from "next/server";
import { errorResponse, noStore } from "@/lib/server/http";
import { listPublicSites } from "@/lib/server/sites";
export const dynamic = "force-dynamic";
export async function GET(req: NextRequest) {
  try { return NextResponse.json(await listPublicSites(req.nextUrl.searchParams.get("cursor")), { headers: noStore }); } catch (e) { return errorResponse(e); }
}
