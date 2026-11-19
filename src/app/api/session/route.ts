import { NextRequest, NextResponse } from "next/server";
import { admin } from "@/lib/server/firebase";
import { assertOrigin, errorResponse, requireUser } from "@/lib/server/http";
export async function POST(req: NextRequest) {
  try {
    assertOrigin(req); await requireUser(req);
    const token = req.headers.get("authorization")!.slice(7);
    const expiresIn = 5 * 24 * 60 * 60 * 1000;
    const session = await admin().auth.createSessionCookie(token, { expiresIn });
    const res = NextResponse.json({ ok: true });
    res.cookies.set("__session", session, { httpOnly: true, secure: new URL(req.url).protocol === "https:", sameSite: "lax", path: "/", maxAge: expiresIn / 1000 });
    return res;
  } catch (e) { return errorResponse(e); }
}
export async function DELETE(req: NextRequest) {
  try { assertOrigin(req); const res = NextResponse.json({ ok: true }); res.cookies.delete("__session"); return res; } catch (e) { return errorResponse(e); }
}
