// Explicit local review helper. Never invoked on startup or against production.
import { readFile } from "node:fs/promises";
const base = "http://127.0.0.1:3000";
const login = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: "browser-review@example.test", password: "LocalReview123!", returnSecureToken: true }) });
if (!login.ok) throw new Error("Create the local browser review account first.");
const account = await login.json();
const payload = JSON.parse(Buffer.from(account.idToken.split(".")[1], "base64url"));
if (payload.aud !== "demo-woori") throw new Error("Local emulator only.");
const headers = { Authorization: `Bearer ${account.idToken}`, Origin: base, "Content-Type": "application/json" };
const current = await (await fetch(`${base}/api/site`, { headers })).json();
async function upload(filename) {
  const res = await fetch(`${base}/api/media/upload`, { method: "POST", headers: { ...headers, "Content-Type": filename.endsWith(".webp") ? "image/webp" : "image/png", "X-Image-Id": crypto.randomUUID() }, body: await readFile(filename) });
  if (!res.ok) throw new Error(await res.text()); return res.json();
}
const hero = await upload("public/images/interior-editorial.webp"), portrait = await upload("public/images/craft-materials.webp");
const content = { ...current.draft, hero, services: ["욕실 리모델링", "주방 부분 공사", "도배·장판"].map(title => ({ id: crypto.randomUUID(), title, description: "현장 상태와 원하시는 방향을 확인한 뒤 작업 범위를 안내합니다." })), projects: ["수원 아파트 욕실 리모델링", "용인 주방 부분 공사", "화성 거실 도배"].map((title, i) => ({ id: crypto.randomUUID(), title, description: "로컬 화면 검토 전용입니다. 실제 작업 사례가 아닙니다.", image: i === 1 ? portrait : hero })) };
const saved = await fetch(`${base}/api/site`, { method: "PUT", headers, body: JSON.stringify({ content, revision: current.revision, draftSlug: "ongyeol-review" }) });
if (!saved.ok) throw new Error(await saved.text());
const savedSite = await saved.json();
if (process.argv.includes("--publish")) {
  const result = await fetch(`${base}/api/site/publish`, { method: "POST", headers, body: JSON.stringify({ content, revision: savedSite.revision, slug: "ongyeol-review" }) });
  if (!result.ok) throw new Error(await result.text());
  console.log("Local review snapshot published to http://127.0.0.1:3000/ongyeol-review only.");
} else console.log("Local review draft saved. Nothing was published.");
