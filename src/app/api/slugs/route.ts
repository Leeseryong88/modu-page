import { NextRequest, NextResponse } from "next/server";
import { slugError } from "@/lib/schema";
import { admin, AppError } from "@/lib/server/firebase";
import { errorResponse, noStore, requireUser } from "@/lib/server/http";
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req); const slug = req.nextUrl.searchParams.get("slug") || "";
    const error = slugError(slug); if (error) throw new AppError(400, error);
    const doc = await admin().db.doc(`slugs/${slug}`).get();
    return NextResponse.json({ available: !doc.exists || doc.data()?.ownerId === user.uid }, { headers: noStore });
  } catch (e) { return errorResponse(e); }
}
