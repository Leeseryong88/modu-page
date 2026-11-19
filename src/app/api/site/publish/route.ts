import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { contentSchema } from "@/lib/schema";
import { assertOrigin, errorResponse, jsonBody, noStore, requireUser } from "@/lib/server/http";
import { saveSite } from "@/lib/server/sites";
export async function POST(req: NextRequest) {
  try {
    assertOrigin(req); const user = await requireUser(req);
    const body = z.object({ content: contentSchema, revision: z.number().int().nonnegative(), slug: z.string().max(30) }).strict().parse(await jsonBody(req));
    return NextResponse.json(await saveSite(user.uid, body.content, body.revision, body.slug), { headers: noStore });
  } catch (e) { return errorResponse(e); }
}
