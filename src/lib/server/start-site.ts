import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { EXAMPLES } from "@/lib/examples";
import { contentSchema, EMPTY_CONTENT, imageIds, type SiteImage } from "@/lib/schema";
import { admin, AppError } from "./firebase";
import { getSite, saveSite } from "./sites";

export async function startSite(uid: string, exampleSlug: string | null, revision: number, replaceDraft = false) {
  const example = exampleSlug === null ? null : EXAMPLES.find(item => item.slug === exampleSlug);
  if (example === undefined) throw new AppError(400, "선택한 예시를 찾지 못했어요. 다른 예시를 선택해주세요.");
  const current = await getSite(uid);
  if (revision !== current.revision) throw new AppError(409, "다른 창에서 내용이 변경됐어요. 새로고침 후 다시 선택해주세요.");
  if (current.revision > 0 && !replaceDraft) throw new AppError(409, "작성한 초안이 있어요. 초안을 바꿀지 먼저 확인해주세요.");
  const content = contentSchema.parse(structuredClone(example?.content ?? EMPTY_CONTENT));
  if (example) {
    const { db, bucket } = admin();
    const images = new Map<string, SiteImage>();
    for (const oldId of imageIds(content)) {
      // Sources come exclusively from the built-in example catalog, never a request URL.
      const source = example.imageSources[oldId];
      if (!source?.startsWith("/images/") || source.includes("..")) throw new AppError(500, "예시 사진을 준비하지 못했어요. 잠시 후 다시 시도해주세요.");
      const data = await readFile(path.join(process.cwd(), "public", source));
      const metadata = await sharp(data).metadata();
      if (!metadata.width || !metadata.height) throw new AppError(500, "예시 사진을 확인하지 못했어요.");
      const image = { id: crypto.randomUUID(), width: metadata.width, height: metadata.height };
      const ref = db.doc(`sites/${uid}/media/${image.id}`);
      // Keep partially copied media discoverable by the existing orphan cleanup job.
      await ref.create({ state: "pending", image, createdAt: new Date().toISOString() });
      await bucket.file(`users/${uid}/media/${image.id}`).save(data, {
        resumable: false, preconditionOpts: { ifGenerationMatch: 0 },
        metadata: { contentType: "image/webp", cacheControl: "private, no-store" },
      });
      await ref.update({ state: "ready" });
      images.set(oldId, image);
    }
    const copied = (image: SiteImage | null) => image ? images.get(image.id)! : null;
    content.hero = copied(content.hero); content.logo = copied(content.logo);
    content.projects = content.projects.map(item => ({ ...item, id: crypto.randomUUID(), image: copied(item.image) }));
    content.services = content.services.map(item => ({ ...item, id: crypto.randomUUID() }));
    // Fictional contact destinations must never receive a real visitor's inquiry.
    content.phone = ""; content.kakao = ""; content.address = ""; content.links = [];
  }
  // The revision is checked again inside the save transaction. Published content stays intact.
  return saveSite(uid, content, revision);
}
