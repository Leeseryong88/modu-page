import { NextRequest, NextResponse } from "next/server";
import { imageIds, type PublicSite, type SiteRecord } from "@/lib/schema";
import { admin, AppError } from "@/lib/server/firebase";
import { errorResponse, noStore } from "@/lib/server/http";
export const runtime = "nodejs";
export async function GET(req: NextRequest, { params }: { params: Promise<{ uid: string; id: string }> }) {
  try {
    const { uid, id } = await params;
    if (!/^[\w-]{1,128}$/.test(uid) || !/^[\da-f-]{36}$/.test(id)) throw new AppError(404, "사진을 찾지 못했어요.");
    const { auth, db, bucket } = admin();
    const siteSnap = await db.doc(`sites/${uid}`).get();
    const site = siteSnap.data() as SiteRecord | undefined;
    let allowed = false;
    if (site?.status === "published" && site.slug) {
      const pub = (await db.doc(`publicSites/${site.slug}`).get()).data() as PublicSite | undefined;
      allowed = !!pub && imageIds(pub.content).includes(id);
    }
    if (!allowed) {
      const session = req.cookies.get("__session")?.value;
      if (session) { try { allowed = (await auth.verifySessionCookie(session, true)).uid === uid; } catch { /* Return the same 404 for all denied images. */ } }
    }
    if (!allowed) throw new AppError(404, "사진을 찾지 못했어요.");
    const file = bucket.file(`users/${uid}/media/${id}`);
    if (!(await file.exists())[0]) throw new AppError(404, "사진을 찾지 못했어요.");
    const [buffer] = await file.download();
    return new NextResponse(new Uint8Array(buffer), { headers: { ...noStore, "Content-Type": "image/webp", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } });
  } catch (e) { return errorResponse(e); }
}
