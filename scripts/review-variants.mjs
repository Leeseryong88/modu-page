// Local-only edge-case content. Never called by the application itself.
import { readFile } from "node:fs/promises";
const base = "http://127.0.0.1:3000";
for (const [name, count] of [["minimum", 0], ["one", 1], ["maximum", 6]]) {
  const signup = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-key", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: `layout-${name}-${Date.now()}@example.test`, password: "LocalTesting123!", returnSecureToken: true }) });
  const account = await signup.json();
  if (!signup.ok || JSON.parse(Buffer.from(account.idToken.split(".")[1], "base64url")).aud !== "demo-woori") throw new Error("Local emulator only.");
  const headers = { Origin: base, Authorization: `Bearer ${account.idToken}`, "Content-Type": "application/json" };
  const fresh = await (await fetch(`${base}/api/site`, { headers })).json();
  const photo = await fetch(`${base}/api/media/upload`, { method: "POST", headers: { ...headers, "Content-Type": "image/png", "X-Image-Id": crypto.randomUUID() }, body: await readFile(".local/review-portrait.png") });
  if (!photo.ok) throw new Error(await photo.text()); const hero = await photo.json();
  const content = { ...fresh.draft, name: "우리동네집수리와부분인테리어전문업체".repeat(2).slice(0, 30), industry: "인테리어", region: "수원·용인·화성·오산·평택·서울·경기전지역".repeat(3).slice(0, 50), tagline: "일상에 맞는 공간을 정성스럽게 만듭니다.", phone: "010-0000-0000", hero, heroPosition: "top", about: name === "maximum" ? "공간을 살펴보고 작업 범위와 일정을 함께 정합니다.\n".repeat(30).padEnd(1000, "가").slice(0, 1000) : "", services: count ? Array.from({ length: count }, (_, i) => ({ id: crypto.randomUUID(), title: `서비스 ${i + 1}`, description: "서비스 설명을 충분히 길게 입력합니다. ".repeat(8).slice(0, 160) })) : [], projects: Array.from({ length: count }, (_, i) => ({ id: crypto.randomUUID(), title: `로컬 검토 작업 ${i + 1} — 실제 업체의 사례가 아닙니다`, description: "세로 사진과 긴 설명의 배치를 확인합니다. ".repeat(9).slice(0, 200), image: hero })) };
  const slug = `review-${name}`;
  const published = await fetch(`${base}/api/site/publish`, { method: "POST", headers, body: JSON.stringify({ content, revision: 0, slug }) });
  if (!published.ok) throw new Error(await published.text()); console.log(`${base}/${slug}`);
}
