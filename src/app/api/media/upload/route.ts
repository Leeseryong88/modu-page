import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { z } from "zod";
import { admin, AppError } from "@/lib/server/firebase";
import { assertOrigin, errorResponse, noStore, requireUser } from "@/lib/server/http";
export const runtime = "nodejs";
export const maxDuration = 30;
export async function POST(req: NextRequest) {
  try {
    assertOrigin(req); const { uid } = await requireUser(req);
    const id = z.string().uuid().parse(req.headers.get("x-image-id"));
    if (!["image/jpeg", "image/png", "image/webp"].includes(req.headers.get("content-type") || "")) throw new AppError(400, "JPG, PNG, WebP 사진만 등록할 수 있어요.");
    const { db, bucket } = admin(); const docRef = db.doc(`sites/${uid}/media/${id}`);
    const existing = await docRef.get();
    if (existing.exists) throw new AppError(409, "이미 등록한 사진이에요. 다시 선택해주세요.");
    const reader = req.body?.getReader(); if (!reader) throw new AppError(400, "사진 파일이 없어요.");
    let size = 0; const chunks: Uint8Array[] = [];
    while (true) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 4_000_000) { await reader.cancel(); throw new AppError(413, "사진 파일이 너무 커요. 작은 사진을 선택해주세요."); } chunks.push(value); }
    const input = Buffer.concat(chunks); let processed;
    try {
      const metadata = await sharp(input, { limitInputPixels: 40_000_000 }).metadata();
      if (!["jpeg", "png", "webp"].includes(metadata.format || "") || (metadata.pages || 1) > 1) throw new Error();
      processed = await sharp(input, { limitInputPixels: 40_000_000 }).rotate().resize({ width: 2560, height: 2560, fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer({ resolveWithObject: true });
    } catch { throw new AppError(400, "올바른 정지 이미지가 아니거나 해상도가 너무 커요. 다른 사진을 선택해주세요."); }
    const image = { id, width: processed.info.width, height: processed.info.height };
    // A server-created object has no Firebase download token. ifGenerationMatch
    // prevents a racing request from overwriting an already referenced photo.
    await bucket.file(`users/${uid}/media/${id}`).save(processed.data, { resumable: false, preconditionOpts: { ifGenerationMatch: 0 }, metadata: { contentType: "image/webp", cacheControl: "private, no-store" } });
    await docRef.create({ state: "ready", image, createdAt: new Date().toISOString() });
    return NextResponse.json(image, { headers: noStore });
  } catch (e) { return errorResponse(e); }
}
