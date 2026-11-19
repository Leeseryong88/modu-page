import "server-only";
import { createHmac } from "node:crypto";
import { FieldPath, type Query } from "firebase-admin/firestore";
import { EMPTY_INQUIRY_STATS, type Inquiry, type InquiryInput, type InquiryStats, type InquiryStatus } from "@/lib/inquiries";
import { slugError, type PublicSite } from "@/lib/schema";
import { admin, AppError } from "./firebase";

type StoredInquiry = Inquiry & { submissionHash: string; consentVersion: string; consentAt: string };
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function checkId(id: string) { if (!idPattern.test(id)) throw new AppError(404, "문의를 찾을 수 없어요."); }
function hash(value: string) {
  const key = process.env.INQUIRY_RATE_LIMIT_SECRET;
  if (!key || key.length < 32) throw new AppError(503, "문의 접수 연결을 준비하고 있어요. 전화로 문의해주세요.");
  return createHmac("sha256", key).update(value).digest("hex");
}
function visible(data: StoredInquiry): Inquiry {
  const { id, name, phone, kind, region, message, slug, siteName, createdAt, updatedAt, status, note, revision } = data;
  return { id, name, phone, kind, region, message, slug, siteName, createdAt, updatedAt, status, note, revision };
}

export async function submitInquiry(slug: string, input: InquiryInput) {
  if (slugError(slug)) throw new AppError(404, "문의할 홈페이지를 찾을 수 없어요.");
  checkId(input.requestId);
  const phone = input.phone.replace(/[^\d+]/g, "");
  const submissionHash = hash(JSON.stringify([slug, input.name, phone, input.kind, input.region, input.message]));
  const { db } = admin();
  return db.runTransaction(async tx => {
    const publicDoc = await tx.get(db.doc(`publicSites/${slug}`));
    if (!publicDoc.exists) throw new AppError(404, "지금은 문의를 접수할 수 없는 홈페이지예요.");
    const site = publicDoc.data() as PublicSite;
    const inbox = db.doc(`inboxes/${site.ownerId}`);
    const ref = inbox.collection("messages").doc(input.requestId);
    const senderRef = db.doc(`inquiryLimits/sender-${hash(`${slug}:${phone}`)}`);
    const siteLimitRef = db.doc(`inquiryLimits/site-${hash(slug)}`);
    const [existing, statsDoc, senderDoc, limitDoc] = await tx.getAll(ref, inbox, senderRef, siteLimitRef);
    if (existing.exists) {
      if (existing.data()?.submissionHash !== submissionHash) throw new AppError(409, "문의 내용이 변경됐어요. 다시 접수해주세요.");
      return { received: true, id: input.requestId }; // A retry never creates or counts a second inquiry.
    }
    const now = Date.now(), iso = new Date(now).toISOString(), day = iso.slice(0, 10);
    const sender = senderDoc.data(), limit = limitDoc.data();
    const senderCount = sender && now - sender.windowStart < 3_600_000 ? sender.count : 0;
    if ((sender && now - sender.lastAt < 60_000) || senderCount >= 5) throw new AppError(429, "잠시 후 다시 문의해주세요. 같은 연락처로 반복 접수는 제한돼요.");
    const siteCount = limit?.day === day ? limit.count : 0;
    if (siteCount >= 200) throw new AppError(429, "오늘 문의 접수가 많아요. 전화나 카카오톡으로 문의해주세요.");
    const record: StoredInquiry = {
      id: input.requestId, name: input.name, phone: input.phone, kind: input.kind, region: input.region, message: input.message,
      slug, siteName: site.content.name, createdAt: iso, updatedAt: iso, status: "new", note: "", revision: 1,
      submissionHash, consentVersion: "inquiry-v1", consentAt: iso,
    };
    const stats = { ...EMPTY_INQUIRY_STATS, ...statsDoc.data() } as InquiryStats;
    tx.create(ref, record);
    tx.set(inbox, { ...stats, total: stats.total + 1, new: stats.new + 1 });
    tx.set(senderRef, { windowStart: senderCount ? sender!.windowStart : now, count: senderCount + 1, lastAt: now });
    tx.set(siteLimitRef, { day, count: siteCount + 1 });
    return { received: true, id: record.id };
  });
}

export async function listInquiries(uid: string, status?: InquiryStatus, cursor?: string | null) {
  const { db } = admin(), inbox = db.doc(`inboxes/${uid}`);
  let query: Query = inbox.collection("messages");
  if (status) query = query.where("status", "==", status);
  query = query.orderBy("createdAt", "desc").orderBy(FieldPath.documentId(), "desc").limit(21);
  if (cursor) {
    try {
      const parsed: unknown = JSON.parse(Buffer.from(cursor, "base64url").toString());
      if (!Array.isArray(parsed) || parsed.length !== 3) throw new Error();
      const [filter, date, id] = parsed;
      if (filter !== (status || "all") || typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}T/.test(date) || typeof id !== "string" || !idPattern.test(id)) throw new Error();
      query = query.startAfter(date, id);
    } catch { throw new AppError(400, "문의 목록을 새로고침해주세요."); }
  }
  const [docs, summary] = await Promise.all([query.get(), inbox.get()]);
  const items = docs.docs.slice(0, 20).map(doc => visible(doc.data() as StoredInquiry)), last = items.at(-1);
  return { items, stats: { ...EMPTY_INQUIRY_STATS, ...summary.data() } as InquiryStats, cursor: docs.size > 20 && last ? Buffer.from(JSON.stringify([status || "all", last.createdAt, last.id])).toString("base64url") : null };
}

export async function getInquiry(uid: string, id: string) {
  checkId(id);
  const doc = await admin().db.doc(`inboxes/${uid}/messages/${id}`).get();
  if (!doc.exists) throw new AppError(404, "문의를 찾을 수 없어요.");
  return visible(doc.data() as StoredInquiry);
}

export async function updateInquiry(uid: string, id: string, change: { status: InquiryStatus; note: string; revision: number }) {
  checkId(id);
  const { db } = admin(), inbox = db.doc(`inboxes/${uid}`), ref = inbox.collection("messages").doc(id);
  return db.runTransaction(async tx => {
    const [doc, statsDoc] = await tx.getAll(ref, inbox);
    if (!doc.exists) throw new AppError(404, "문의를 찾을 수 없어요.");
    const current = doc.data() as StoredInquiry;
    if (current.revision !== change.revision) throw new AppError(409, "다른 창에서 문의가 변경됐어요. 새로고침 후 다시 확인해주세요.");
    const next = { ...current, status: change.status, note: change.note, revision: current.revision + 1, updatedAt: new Date().toISOString() };
    if (current.status !== next.status) {
      const stats = { ...EMPTY_INQUIRY_STATS, ...statsDoc.data() } as InquiryStats;
      stats[current.status] = Math.max(0, stats[current.status] - 1); stats[next.status] += 1;
      tx.set(inbox, stats);
    }
    tx.set(ref, next);
    return visible(next);
  });
}

export async function deleteInquiry(uid: string, id: string, revision: number) {
  checkId(id);
  const { db } = admin(), inbox = db.doc(`inboxes/${uid}`), ref = inbox.collection("messages").doc(id);
  return db.runTransaction(async tx => {
    const [doc, statsDoc] = await tx.getAll(ref, inbox);
    if (!doc.exists) throw new AppError(404, "문의를 찾을 수 없어요.");
    const current = doc.data() as StoredInquiry;
    if (current.revision !== revision) throw new AppError(409, "다른 창에서 문의가 변경됐어요. 새로고침 후 다시 확인해주세요.");
    const stats = { ...EMPTY_INQUIRY_STATS, ...statsDoc.data() } as InquiryStats;
    stats.total = Math.max(0, stats.total - 1); stats[current.status] = Math.max(0, stats[current.status] - 1);
    tx.delete(ref); tx.set(inbox, stats);
    return { deleted: true };
  });
}
