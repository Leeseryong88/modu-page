import "server-only";
import { FieldPath, type Transaction } from "firebase-admin/firestore";
import { EMPTY_CONTENT, imageIds, publishIssues, slugError, type SiteContent, type SiteRecord, type PublicSite } from "@/lib/schema";
import { admin, AppError } from "./firebase";
export function freshSite(ownerId: string): SiteRecord { return { ownerId, draft: { ...EMPTY_CONTENT }, draftSlug: "", published: null, slug: null, status: "draft", revision: 0, savedAt: null, firstPublishedAt: null, publishedAt: null }; }
export async function getSite(uid: string): Promise<SiteRecord> {
  const snapshot = await admin().db.doc(`sites/${uid}`).get();
  return snapshot.exists ? snapshot.data() as SiteRecord : freshSite(uid);
}
async function verifyImages(tx: Transaction, uid: string, content: SiteContent) {
  const ids = imageIds(content);
  if (!ids.length) return;
  const refs = ids.map(id => admin().db.doc(`sites/${uid}/media/${id}`));
  const docs = await tx.getAll(...refs);
  for (const doc of docs) if (!doc.exists || doc.data()?.state !== "ready") throw new AppError(400, "사진 등록이 완료되지 않았어요. 사진을 다시 등록해주세요.");
}
export async function saveSite(uid: string, content: SiteContent, revision: number, publishSlug?: string, draftSlug?: string): Promise<SiteRecord> {
  const { db } = admin();
  if (publishSlug !== undefined) {
    const error = slugError(publishSlug);
    if (error) throw new AppError(400, error, [{ path: "slug", message: error, step: 4 }]);
    const issues = publishIssues(content);
    if (issues.length) throw new AppError(400, "공개 전에 아래 항목을 확인해주세요.", issues);
  }
  return db.runTransaction(async tx => {
    const siteRef = db.doc(`sites/${uid}`);
    const snapshot = await tx.get(siteRef);
    const site = snapshot.exists ? snapshot.data() as SiteRecord : freshSite(uid);
    if (revision !== site.revision) throw new AppError(409, "다른 창에서 내용이 변경됐어요. 현재 내용을 복사해 보관한 뒤 새로고침해주세요.");
    if (publishSlug !== undefined && site.slug && site.slug !== publishSlug) throw new AppError(400, "최초 공개한 주소는 변경할 수 없어요.");
    if (publishSlug !== undefined) {
      const slugDoc = await tx.get(db.doc(`slugs/${publishSlug}`));
      if (slugDoc.exists && slugDoc.data()?.ownerId !== uid) throw new AppError(409, "이미 사용 중인 주소예요. 다른 주소를 입력해주세요.", [{ path: "slug", message: "이미 사용 중인 주소예요.", step: 4 }]);
    }
    await verifyImages(tx, uid, content);
    const now = new Date().toISOString();
    const updated: SiteRecord = { ...site, ownerId: uid, draft: content, draftSlug: publishSlug ?? site.slug ?? draftSlug ?? site.draftSlug ?? "", revision: site.revision + 1, savedAt: now };
    if (publishSlug !== undefined) {
      updated.slug = publishSlug; updated.status = "published"; updated.published = content;
      updated.firstPublishedAt ||= now; updated.publishedAt = now;
      const publicSite: PublicSite = { ownerId: uid, slug: publishSlug, content, firstPublishedAt: updated.firstPublishedAt, publishedAt: now };
      tx.set(db.doc(`slugs/${publishSlug}`), { ownerId: uid });
      tx.set(db.doc(`publicSites/${publishSlug}`), publicSite);
    }
    tx.set(siteRef, updated);
    return updated;
  });
}
export async function unpublishSite(uid: string, revision: number) {
  const { db } = admin();
  return db.runTransaction(async tx => {
    const ref = db.doc(`sites/${uid}`);
    const snap = await tx.get(ref);
    if (!snap.exists) throw new AppError(404, "홈페이지가 없어요.");
    const site = snap.data() as SiteRecord;
    if (site.revision !== revision) throw new AppError(409, "다른 창에서 변경됐어요. 새로고침 후 다시 시도해주세요.");
    if (!site.slug) throw new AppError(400, "아직 공개하지 않은 홈페이지예요.");
    const next: SiteRecord = { ...site, status: "private", revision: revision + 1 };
    tx.delete(db.doc(`publicSites/${site.slug}`)); tx.set(ref, next);
    return next;
  });
}
export async function getPublicSite(slug: string): Promise<PublicSite | null> {
  if (slugError(slug)) return null;
  const doc = await admin().db.doc(`publicSites/${slug}`).get();
  return doc.exists ? doc.data() as PublicSite : null;
}
export async function listPublicSites(cursor?: string | null) {
  let query = admin().db.collection("publicSites").orderBy("firstPublishedAt", "desc").orderBy(FieldPath.documentId(), "desc").limit(13);
  if (cursor) {
    try {
      const [date, slug] = JSON.parse(Buffer.from(cursor, "base64url").toString());
      if (typeof date !== "string" || typeof slug !== "string" || slugError(slug) || !/^\d{4}-\d{2}-\d{2}T/.test(date)) throw new Error();
      query = query.startAfter(date, slug);
    } catch { throw new AppError(400, "목록을 다시 불러와주세요."); }
  }
  const docs = (await query.get()).docs;
  const items = docs.slice(0, 12).map(doc => doc.data() as PublicSite);
  const last = items.at(-1);
  return { items, cursor: docs.length > 12 && last ? Buffer.from(JSON.stringify([last.firstPublishedAt, last.slug])).toString("base64url") : null };
}
