import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { inquiryUpdateSchema } from "@/lib/inquiries";
import { assertOrigin, errorResponse, jsonBody, noStore, requireUser } from "@/lib/server/http";
import { deleteInquiry, getInquiry, updateInquiry } from "@/lib/server/inquiries";
export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };
export async function GET(req: NextRequest, { params }: Context) {
  try { const user = await requireUser(req); return NextResponse.json(await getInquiry(user.uid, (await params).id), { headers: noStore }); } catch (e) { return errorResponse(e); }
}
export async function PATCH(req: NextRequest, { params }: Context) {
  try { assertOrigin(req); const user = await requireUser(req); const input = inquiryUpdateSchema.parse(await jsonBody(req)); return NextResponse.json(await updateInquiry(user.uid, (await params).id, input), { headers: noStore }); } catch (e) { return errorResponse(e); }
}
export async function DELETE(req: NextRequest, { params }: Context) {
  try { assertOrigin(req); const user = await requireUser(req); const { revision } = z.object({ revision: z.number().int().positive() }).strict().parse(await jsonBody(req)); return NextResponse.json(await deleteInquiry(user.uid, (await params).id, revision), { headers: noStore }); } catch (e) { return errorResponse(e); }
}
