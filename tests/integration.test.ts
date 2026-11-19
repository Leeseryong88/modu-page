import { beforeAll, describe, expect, it } from "vitest";
import { EMPTY_CONTENT, type SiteContent } from "@/lib/schema";
import { admin } from "@/lib/server/firebase";
import { getSite, getPublicSite, listPublicSites, saveSite, unpublishSite } from "@/lib/server/sites";
beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error("이 검증은 Firebase Emulator에서만 실행할 수 있습니다. npm run test:firebase를 실행하세요.");
  process.env.FIREBASE_PROJECT_ID = "demo-woori"; process.env.FIREBASE_STORAGE_BUCKET = "demo-woori.appspot.com"; process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS = "true";
});
function uid() { return `test-${crypto.randomUUID()}`; }
async function validContent(owner: string): Promise<SiteContent> {
  const hero = { id: crypto.randomUUID(), width: 1200, height: 900 };
  await admin().db.doc(`sites/${owner}/media/${hero.id}`).set({ state: "ready", image: hero });
  return { ...EMPTY_CONTENT, name: "온결인테리어", industry: "인테리어", region: "수원·용인·화성", tagline: "주방과 욕실, 생활에 맞게 새롭게.", phone: "010-0000-0000", hero };
}
describe("실제 Firestore 트랜잭션", () => {
  it("입력 중인 주소도 초안에 저장하지만 예약은 공개 시에만 한다", async () => {
    const owner = uid(); const address = `draft-${crypto.randomUUID().slice(0, 8)}`;
    await saveSite(owner, EMPTY_CONTENT, 0, undefined, address);
    expect((await getSite(owner)).draftSlug).toBe(address);
    expect((await admin().db.doc(`slugs/${address}`).get()).exists).toBe(false);
  });
  it("목록은 최초 공개일 최신순 12개와 다음 페이지로 나누고 중복하지 않는다", async () => {
    const owner = uid(), content = await validContent(owner), prefix = `page-${crypto.randomUUID().slice(0, 6)}`;
    const refs = Array.from({ length: 13 }, (_, i) => admin().db.doc(`publicSites/${prefix}-${i}`));
    try {
      await Promise.all(refs.map((ref, i) => ref.set({ ownerId: owner, slug: ref.id, content, firstPublishedAt: `2099-01-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`, publishedAt: new Date().toISOString() })));
      const first = await listPublicSites(); expect(first.items).toHaveLength(12); expect(first.items[0].slug).toBe(`${prefix}-12`); expect(first.cursor).toBeTruthy();
      const second = await listPublicSites(first.cursor); expect(second.items[0].slug).toBe(`${prefix}-0`);
      expect(second.items.some(s => first.items.some(p => p.slug === s.slug))).toBe(false);
    } finally { await Promise.all(refs.map(ref => ref.delete())); }
  });
  it("미완성 저장/재조회, 공개본 분리, 업데이트, 비공개, 재공개", async () => {
    const owner = uid(), slug = `s-${crypto.randomUUID().slice(0, 10)}`;
    const draft = await saveSite(owner, { ...EMPTY_CONTENT, name: "작성 중" }, 0);
    expect((await getSite(owner)).draft.name).toBe("작성 중"); expect(draft.status).toBe("draft");
    const content = await validContent(owner);
    const published = await saveSite(owner, content, 1, slug);
    expect((await getPublicSite(slug))?.content).toEqual(content);
    const edited = await saveSite(owner, { ...content, name: "새 업체명" }, published.revision);
    expect((await getPublicSite(slug))?.content.name).toBe(content.name);
    const updated = await saveSite(owner, edited.draft, edited.revision, slug);
    expect((await getPublicSite(slug))?.content.name).toBe("새 업체명"); expect(updated.firstPublishedAt).toBe(published.firstPublishedAt);
    const hidden = await unpublishSite(owner, updated.revision);
    expect(await getPublicSite(slug)).toBeNull(); expect((await listPublicSites()).items.some(s => s.slug === slug)).toBe(false);
    expect((await admin().db.doc(`slugs/${slug}`).get()).data()?.ownerId).toBe(owner);
    const again = await saveSite(owner, hidden.draft, hidden.revision, slug);
    expect(again.status).toBe("published"); expect(again.firstPublishedAt).toBe(published.firstPublishedAt);
  });
  it("두 계정이 같은 주소를 동시에 공개하면 하나만 성공", async () => {
    const a = uid(), b = uid(), slug = `race-${crypto.randomUUID().slice(0, 8)}`;
    const [ca, cb] = await Promise.all([validContent(a), validContent(b)]);
    const results = await Promise.allSettled([saveSite(a, ca, 0, slug), saveSite(b, cb, 0, slug)]);
    expect(results.filter(r => r.status === "fulfilled")).toHaveLength(1); expect(results.filter(r => r.status === "rejected")).toHaveLength(1);
  });
  it("동일 계정의 두 탭에서 동시에 다른 주소로 공개해도 한 사이트만 생성", async () => {
    const owner = uid(), content = await validContent(owner); const s1 = `one-${crypto.randomUUID().slice(0, 8)}`, s2 = `two-${crypto.randomUUID().slice(0, 8)}`;
    const result = await Promise.allSettled([saveSite(owner, content, 0, s1), saveSite(owner, content, 0, s2)]);
    expect(result.filter(r => r.status === "fulfilled")).toHaveLength(1);
    const sites = await Promise.all([getPublicSite(s1), getPublicSite(s2)]); expect(sites.filter(Boolean)).toHaveLength(1);
  });
  it("타 계정 사진을 참조하거나 오래된 초안을 덮어쓰지 못한다", async () => {
    const a = uid(), b = uid(), ca = await validContent(a);
    await expect(saveSite(b, ca, 0)).rejects.toThrow("사진 등록");
    await saveSite(a, ca, 0); await expect(saveSite(a, ca, 0)).rejects.toThrow("다른 창");
  });
  it("최초 공개 후 주소 변경 불가, 비공개 주소도 재사용 불가", async () => {
    const a = uid(), b = uid(), ca = await validContent(a), cb = await validContent(b); const slug = `fixed-${crypto.randomUUID().slice(0, 8)}`;
    const site = await saveSite(a, ca, 0, slug);
    await expect(saveSite(a, ca, site.revision, `${slug}-new`)).rejects.toThrow("변경");
    await unpublishSite(a, site.revision); await expect(saveSite(b, cb, 0, slug)).rejects.toThrow("사용 중");
  });
  it("초안 사진 삭제는 공개본 이미지 참조를 보존", async () => {
    const owner = uid(), content = await validContent(owner), slug = `image-${crypto.randomUUID().slice(0, 8)}`;
    const site = await saveSite(owner, content, 0, slug); await saveSite(owner, { ...content, hero: null }, site.revision);
    expect((await getPublicSite(slug))?.content.hero).toEqual(content.hero); expect((await admin().db.doc(`sites/${owner}/media/${content.hero!.id}`).get()).exists).toBe(true);
  });
});
