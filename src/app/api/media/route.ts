import { NextRequest, NextResponse } from "next/server";
import { FieldPath } from "firebase-admin/firestore";
import { imageIds, imageSchema, type SiteRecord } from "@/lib/schema";
import { admin, AppError } from "@/lib/server/firebase";
import { errorResponse, noStore, requireUser } from "@/lib/server/http";

export const runtime = "nodejs";
export async function GET(req: NextRequest) {
  try {
    const { uid } = await requireUser(req);
    const cursor = req.nextUrl.searchParams.get("cursor");
    if (cursor && !/^[\da-f-]{36}$/.test(cursor)) throw new AppError(400, "사진 목록을 다시 불러와주세요.");
    const { db } = admin();
    const site = (await db.doc(`sites/${uid}`).get()).data() as SiteRecord | undefined;
    const used = new Set([...(site ? imageIds(site.draft) : []), ...(site?.published ? imageIds(site.published) : [])]);
    let query = db.collection(`sites/${uid}/media`).orderBy(FieldPath.documentId()).limit(41);
    if (cursor) query = query.startAfter(cursor);
    const docs = (await query.get()).docs;
    const page = docs.slice(0, 40);
    const images = page.flatMap(doc => {
      const data = doc.data(), parsed = imageSchema.safeParse(data.image);
      if (data.state !== "ready" || !(data.library === true || used.has(doc.id)) || !parsed.success) return [];
      const { id, width, height } = parsed.data;
      return [{ id, width, height }];
    });
    return NextResponse.json({ images, cursor: docs.length > 40 ? page.at(-1)!.id : null }, { headers: noStore });
  } catch (error) { return errorResponse(error); }
}
