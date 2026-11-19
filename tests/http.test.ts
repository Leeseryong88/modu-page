import { beforeAll, describe, expect, it } from "vitest";
import sharp from "sharp";
import { EMPTY_CONTENT, type SiteImage, type SiteRecord } from "@/lib/schema";
const base = process.env.NEXT_PUBLIC_SITE_URL || "http://127.0.0.1:3000";
type Account = { idToken: string; localId: string; email: string; cookie: string };
let a: Account, b: Account;
async function account(): Promise<Account> {
  const email = `http-${crypto.randomUUID()}@example.test`;
  const res = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password: "LocalTesting123!", returnSecureToken: true }) });
  expect(res.status).toBe(200); const user = await res.json();
  const session = await fetch(`${base}/api/session`, { method: "POST", headers: { Origin: base, Authorization: `Bearer ${user.idToken}` } });
  expect(session.status).toBe(200); return { ...user, email, cookie: session.headers.get("set-cookie")!.split(";")[0] };
}
function request(user: Account, path: string, method = "GET", body?: unknown) { return fetch(base + path, { method, headers: { Origin: base, Authorization: `Bearer ${user.idToken}`, "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) }); }
async function upload(user: Account, color = "#526449"): Promise<SiteImage> {
  const data = await sharp({ create: { width: 450, height: 900, channels: 3, background: color } }).png().toBuffer();
  const response = await fetch(`${base}/api/media/upload`, { method: "POST", headers: { Origin: base, Authorization: `Bearer ${user.idToken}`, "Content-Type": "image/png", "X-Image-Id": crypto.randomUUID() }, body: new Uint8Array(data) });
  expect(response.status).toBe(200); return response.json();
}
beforeAll(async () => {
  if (process.env.FIREBASE_PROJECT_ID !== "demo-woori") throw new Error("로컬 에뮬레이터 전용 테스트입니다.");
  [a, b] = await Promise.all([account(), account()]);
});
describe("브라우저가 사용하는 실제 HTTP 흐름", () => {
  it("인증 없이 초안 조회 차단, 다른 Origin 변경 요청 차단", async () => { expect((await fetch(`${base}/api/site`)).status).toBe(401); expect((await fetch(`${base}/api/site`, { method: "PUT", headers: { Origin: "https://evil.example", Authorization: `Bearer ${a.idToken}`, "Content-Type": "application/json" }, body: JSON.stringify({ content: EMPTY_CONTENT, revision: 0 }) })).status).toBe(403); });
  it("로그인·비밀번호 재설정 요청이 에뮬레이터에 실제로 전달됨", async () => {
    const login = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: a.email, password: "LocalTesting123!", returnSecureToken: true }) }); expect(login.status).toBe(200);
    const reset = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=demo-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestType: "PASSWORD_RESET", email: a.email }) }); expect(reset.status).toBe(200);
  });
  it("임의 ownerId 주입 차단, 미완성 초안 재접속 유지, 다른 계정에는 노출하지 않음", async () => {
    expect((await request(a, "/api/site", "PUT", { content: EMPTY_CONTENT, revision: 0, ownerId: b.localId })).status).toBe(400);
    expect((await request(a, "/api/site", "PUT", { content: { ...EMPTY_CONTENT, name: "HTTP 임시저장" }, revision: 0 })).status).toBe(200);
    expect((await (await request(a, "/api/site")).json()).draft.name).toBe("HTTP 임시저장");
    expect((await (await request(b, "/api/site")).json()).draft.name).toBe("");
  });
  it("서버에서 형식 위장 SVG 파일도 차단", async () => {
    const response = await fetch(`${base}/api/media/upload`, { method: "POST", headers: { Origin: base, Authorization: `Bearer ${a.idToken}`, "Content-Type": "image/png", "X-Image-Id": crypto.randomUUID() }, body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" /></svg>' }); expect(response.status).toBe(400);
  });
  it("초안 사진 접근 제어, 최초 공개, 사진 교체·삭제, 공개 업데이트, 비공개·재공개", async () => {
    const hero = await upload(a), other = await upload(a, "#7f4c38"); const url = `/api/media/${a.localId}/${hero.id}`, otherUrl = `/api/media/${a.localId}/${other.id}`;
    expect((await fetch(base + url)).status).toBe(404);
    expect((await fetch(base + url, { headers: { Cookie: b.cookie } })).status).toBe(404);
    expect((await fetch(base + url, { headers: { Cookie: a.cookie } })).status).toBe(200);
    const slug = `http-${crypto.randomUUID().slice(0, 8)}`;
    const content = { ...EMPTY_CONTENT, name: "온결인테리어", industry: "인테리어", region: "수원·용인·화성", tagline: "주방과 욕실, 생활에 맞게 새롭게.", phone: "010-0000-0000", hero };
    let response = await request(a, "/api/site/publish", "POST", { content, revision: 1, slug }); expect(response.status).toBe(200); let site: SiteRecord = await response.json();
    const publicPage = await fetch(`${base}/${slug}`); expect(publicPage.status).toBe(200); const html = await publicPage.text(); expect(html).toContain("온결인테리어"); expect(html).toContain('rel="canonical"'); expect(html).toContain('property="og:image"'); expect(html).not.toContain("업체명을 입력해주세요");
    expect((await fetch(base + url)).status).toBe(200); expect((await fetch(base + otherUrl)).status).toBe(404);
    response = await request(a, "/api/site", "PUT", { content: { ...content, hero: null }, revision: site.revision }); expect(response.status).toBe(200); site = await response.json();
    expect((await fetch(base + url)).status).toBe(200);
    response = await request(a, "/api/site/publish", "POST", { content: { ...content, hero: other }, revision: site.revision, slug }); expect(response.status).toBe(200); site = await response.json();
    expect((await fetch(base + url)).status).toBe(404); expect((await fetch(base + otherUrl)).status).toBe(200);
    response = await request(a, "/api/site/unpublish", "POST", { revision: site.revision }); expect(response.status).toBe(200); site = await response.json();
    expect((await fetch(`${base}/${slug}`)).status).toBe(404); expect((await fetch(base + otherUrl)).status).toBe(404);
    const items = (await (await fetch(`${base}/api/sites`)).json()).items; expect(items.some((s: { slug: string }) => s.slug === slug)).toBe(false);
    response = await request(a, "/api/site/publish", "POST", { content: site.draft, revision: site.revision, slug }); expect(response.status).toBe(200); site = await response.json();
    expect((await fetch(`${base}/${slug}`)).status).toBe(200);
    // Keep integration fixtures out of the UI review's public list.
    await request(a, "/api/site/unpublish", "POST", { revision: site.revision });
  });
  it("로그아웃은 서버 이미지 세션 쿠키를 제거한다", async () => { const response = await fetch(`${base}/api/session`, { method: "DELETE", headers: { Origin: base, Cookie: a.cookie } }); expect(response.status).toBe(200); expect(response.headers.get("set-cookie")).toContain("Expires=Thu, 01 Jan 1970"); });
});
