import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { contentSchema } from "@/lib/schema";
import { assertOrigin, errorResponse, jsonBody, noStore, requireUser } from "@/lib/server/http";
import { getSite, saveSite } from "@/lib/server/sites";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  try { const user = await requireUser(req); return NextResponse.json(await getSite(user.uid), { headers: noStore }); } catch (e) { return errorResponse(e); }
}
export async function PUT(req: NextRequest) {
  try {
    assertOrigin(req); const user = await requireUser(req);
    const body = z.object({ content: contentSchema, revision: z.number().int().nonnegative(), draftSlug: z.string().max(30).optional() }).strict().parse(await jsonBody(req));
    return NextResponse.json(await saveSite(user.uid, body.content, body.revision, undefined, body.draftSlug), { headers: noStore });
  } catch (e) { return errorResponse(e); }
}
