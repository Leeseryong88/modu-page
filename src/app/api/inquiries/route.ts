import { NextRequest, NextResponse } from "next/server";
import { inquiryStatusSchema } from "@/lib/inquiries";
import { errorResponse, noStore, requireUser } from "@/lib/server/http";
import { listInquiries } from "@/lib/server/inquiries";
export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req), rawStatus = req.nextUrl.searchParams.get("status");
    const status = rawStatus && rawStatus !== "all" ? inquiryStatusSchema.parse(rawStatus) : undefined;
    return NextResponse.json(await listInquiries(user.uid, status, req.nextUrl.searchParams.get("cursor")), { headers: noStore });
  } catch (error) { return errorResponse(error); }
}
