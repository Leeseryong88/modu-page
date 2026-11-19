import { NextRequest, NextResponse } from "next/server";
import { inquiryInputSchema } from "@/lib/inquiries";
import { assertOrigin, errorResponse, jsonBody, noStore } from "@/lib/server/http";
import { submitInquiry } from "@/lib/server/inquiries";
export const runtime = "nodejs";
export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    assertOrigin(req);
    const input = inquiryInputSchema.parse(await jsonBody(req));
    return NextResponse.json(await submitInquiry((await params).slug, input), { headers: noStore });
  } catch (error) { return errorResponse(error); }
}
