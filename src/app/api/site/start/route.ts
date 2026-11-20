import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { assertOrigin, errorResponse, jsonBody, noStore, requireUser } from "@/lib/server/http";
import { startSite } from "@/lib/server/start-site";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function POST(req: NextRequest) {
  try {
    assertOrigin(req);
    const user = await requireUser(req);
    const body = z.object({ exampleSlug: z.string().max(60).nullable(), revision: z.number().int().nonnegative(), replaceDraft: z.boolean().default(false) }).strict().parse(await jsonBody(req));
    return NextResponse.json(await startSite(user.uid, body.exampleSlug, body.revision, body.replaceDraft), { headers: noStore });
  } catch (e) { return errorResponse(e); }
}
