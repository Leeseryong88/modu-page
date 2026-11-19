import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertOrigin, errorResponse, jsonBody, noStore, requireUser } from "@/lib/server/http";
import { unpublishSite } from "@/lib/server/sites";
export async function POST(req: NextRequest) {
  try { assertOrigin(req); const user = await requireUser(req); const { revision } = z.object({ revision: z.number().int().nonnegative() }).strict().parse(await jsonBody(req)); return NextResponse.json(await unpublishSite(user.uid, revision), { headers: noStore }); }
  catch (e) { return errorResponse(e); }
}
