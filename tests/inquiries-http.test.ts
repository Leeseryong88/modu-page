import { beforeAll, describe, expect, it } from "vitest";
import { admin } from "@/lib/server/firebase";
const base = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000";
type Account = { idToken: string; localId: string };
let a: Account, b: Account, slug: string;
const inquiry = () => ({ requestId: crypto.randomUUID(), name: "테스트 고객", phone: "010-4321-8765", kind: "견적 문의", region: "수원", message: "주방 리모델링 방문 상담을 신청합니다.", consent: true, website: "" });
function request(path: string, method = "GET", body?: unknown, user?: Account, origin = base) { return fetch(base + path, { method, headers: { Origin: origin, "Content-Type": "application/json", ...(user ? { Authorization: `Bearer ${user.idToken}` } : {}) }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }); }
beforeAll(async () => {
  if (process.env.FIREBASE_PROJECT_ID !== "demo-woori") throw new Error("Emulator only");
  const account = async () => { const r = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: `inq-${crypto.randomUUID()}@example.test`, password: "LocalTesting123!", returnSecureToken: true }) }); expect(r.status).toBe(200); return r.json(); };
  [a, b] = await Promise.all([account(), account()]); slug = `inq-http-${crypto.randomUUID().slice(0, 8)}`; await admin().db.doc(`publicSites/${slug}`).set({ ownerId: a.localId, slug, content: { name: "온결인테리어" } });
});
describe("공개 문의와 비공개 문의함 HTTP", () => {
  it("비로그인 접수, 재전송, 소유자별 조회, 상태·메모, 삭제까지 연결된다", async () => {
    const body = inquiry(), path = `/api/public/inquiries/${slug}`;
    expect((await request(path, "POST", body)).status).toBe(200); expect((await request(path, "POST", body)).status).toBe(200);
    expect((await request("/api/inquiries")).status).toBe(401);
    const list = await request("/api/inquiries", "GET", undefined, a); expect(list.headers.get("cache-control")).toContain("no-store"); const data = await list.json(); expect(data.stats).toEqual({ total: 1, new: 1, progress: 0, done: 0 }); expect(data.items[0].message).toBe(body.message);
    expect((await (await request("/api/inquiries", "GET", undefined, b)).json()).stats.total).toBe(0);
    const itemPath = `/api/inquiries/${body.requestId}`;
    expect((await request(itemPath, "GET", undefined, b)).status).toBe(404); expect((await request(itemPath, "PATCH", { status: "done", note: "", revision: 1 }, b)).status).toBe(404); expect((await request(itemPath, "DELETE", { revision: 1 }, b)).status).toBe(404);
    const updated = await request(itemPath, "PATCH", { status: "progress", note: "금요일 방문 상담", revision: 1 }, a); expect(updated.status).toBe(200); expect((await updated.json()).note).toBe("금요일 방문 상담");
    expect((await request(itemPath, "PATCH", { status: "done", note: "", revision: 1 }, a)).status).toBe(409);
    expect((await (await request("/api/inquiries?status=new", "GET", undefined, a)).json()).items).toHaveLength(0);
    const progress = await (await request("/api/inquiries?status=progress", "GET", undefined, a)).json(); expect(progress.stats.progress).toBe(1); expect(progress.items).toHaveLength(1);
    await admin().db.doc(`publicSites/${slug}`).delete(); expect((await request(path, "POST", inquiry())).status).toBe(404); expect((await request(itemPath, "GET", undefined, a)).status).toBe(200);
    expect((await request(itemPath, "DELETE", { revision: 2 }, a)).status).toBe(200); expect((await (await request("/api/inquiries", "GET", undefined, a)).json()).stats.total).toBe(0);
  });
  it("외부 출처, 동의 누락, 소유자 주입, 허니팟, 잘못된 필터·커서를 거부한다", async () => {
    const path = `/api/public/inquiries/${slug}`; expect((await request(path, "POST", inquiry(), undefined, "https://evil.example")).status).toBe(403);
    for (const extra of [{ consent: false }, { ownerId: b.localId }, { website: "spam.example" }, { phone: "abc" }]) expect((await request(path, "POST", { ...inquiry(), ...extra })).status).toBe(400);
    expect((await request("/api/inquiries?status=invalid", "GET", undefined, a)).status).toBe(400); expect((await request("/api/inquiries?cursor=wrong", "GET", undefined, a)).status).toBe(400);
  });
});
