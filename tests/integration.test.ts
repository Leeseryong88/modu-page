import { beforeAll, describe, expect, it } from "vitest";
import { EMPTY_CONTENT, contentSchema, imageIds, publishIssues, type SiteContent } from "@/lib/schema";
import { EXAMPLES } from "@/lib/examples";
import { startSite } from "@/lib/server/start-site";
import { admin } from "@/lib/server/firebase";
import { getSite, getPublicSite, listPublicSites, saveSite, unpublishSite } from "@/lib/server/sites";
beforeAll(() => {
  if (!process.env.FIRESTORE_EMULATOR_HOST) throw new Error("이 검증은 Firebase Emulator에서만 실행할 수 있습니다. npm run test:firebase를 실행하세요.");
  process.env.FIREBASE_PROJECT_ID = "demo-woori"; process.env.FIREBASE_STORAGE_BUCKET = "demo-woori.appspot.com"; process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS = "true";
});
function uid() { return `test-${crypto.randomUUID()}`; }
describe("예시에서 내 홈페이지 시작하기", () => {
  it("처음부터 시작한 빈 초안도 새로 접속하면 유지한다", async () => {
    const owner = uid(); const site = await startSite(owner, null, 0);
    expect(site.revision).toBe(1); expect(site.draft).toEqual(EMPTY_CONTENT);
    expect(await getSite(owner)).toEqual(site);
  });
  it.each(["workshop", "bookclub", "cafe"])("%s의 디자인·글·사진을 독립된 초안으로 복사하고 수정·공개한다", async exampleSlug => {
    const owner = uid(); const example = EXAMPLES.find(item => item.slug === exampleSlug)!;
    const before = structuredClone(example);
    const site = await startSite(owner, exampleSlug, 0);
    expect(site.status).toBe("draft"); expect(site.published).toBeNull();
    expect(site.draft.layout).toEqual(example.content.layout); expect(site.draft.color).toBe(example.content.color);
    expect(site.draft.name).toBe(example.content.name); expect(site.draft.about).toBe(example.content.about);
    expect(site.draft.projects.map(item => [item.title, item.description])).toEqual(example.content.projects.map(item => [item.title, item.description]));
    expect(site.draft.phone).toBe(""); expect(site.draft.kakao).toBe(""); expect(site.draft.links).toEqual([]);
    expect(contentSchema.safeParse(site.draft).success).toBe(true); expect(publishIssues(site.draft)).toEqual([]);
    const ids = imageIds(site.draft); expect(ids).toHaveLength(4);
    for (const id of ids) {
      expect(imageIds(example.content)).not.toContain(id);
      expect((await admin().db.doc(`sites/${owner}/media/${id}`).get()).data()?.state).toBe("ready");
      const [data] = await admin().bucket.file(`users/${owner}/media/${id}`).download(); expect(data.length).toBeGreaterThan(1000);
    }
    const own = { ...site.draft, name: "내가 만든 홈페이지", projects: site.draft.projects.slice(0, 2) };
    const saved = await saveSite(owner, own, site.revision);
    expect((await getSite(owner)).draft).toEqual(own);
    const slug = `copy-${crypto.randomUUID().slice(0, 8)}`;
    const published = await saveSite(owner, own, saved.revision, slug);
    expect((await getPublicSite(slug))?.content).toEqual(own); expect(example).toEqual(before);
    await unpublishSite(owner, published.revision);
  });
  it("기존 초안 교체에는 명시적 선택이 필요하고 공개본과 주소를 보존한다", async () => {
    const owner = uid(), slug = `keep-${crypto.randomUUID().slice(0, 8)}`;
    const original = await saveSite(owner, await validContent(owner), 0, slug);
    await expect(startSite(owner, "workshop", original.revision)).rejects.toThrow("먼저 확인");
    const replaced = await startSite(owner, "workshop", original.revision, true);
    expect(replaced.draft.name).toBe("주말의 작업실"); expect(replaced.slug).toBe(slug);
    expect(replaced.published).toEqual(original.published); expect(replaced.status).toBe("published");
    expect((await getPublicSite(slug))?.content).toEqual(original.published);
    await expect(startSite(owner, "bookclub", original.revision, true)).rejects.toThrow("다른 창");
    await expect(saveSite(uid(), replaced.draft, 0)).rejects.toThrow("사진 등록");
    await unpublishSite(owner, replaced.revision);
  });
  it("유효하지 않은 예시로 초안을 만들지 않는다", async () => {
    const owner = uid(); await expect(startSite(owner, "../../secret", 0)).rejects.toThrow("예시를 찾지");
    expect((await getSite(owner)).revision).toBe(0);
  });
});
async function validContent(owner: string): Promise<SiteContent> {
  const hero = { id: crypto.randomUUID(), width: 1200, height: 900 };
  await admin().db.doc(`sites/${owner}/media/${hero.id}`).set({ state: "ready", image: hero });
  return { ...EMPTY_CONTENT, name: "온결인테리어", industry: "인테리어", region: "수원·용인·화성", tagline: "주방과 욕실, 생활에 맞게 새롭게.", phone: "010-0000-0000", hero };
}
describe("실제 Firestore 트랜잭션", () => {
  it("개인 포트폴리오를 전화번호와 지역 없이 저장·공개한다", async () => {
    const owner = uid(), slug = `person-${crypto.randomUUID().slice(0, 8)}`;
    const content = { ...await validContent(owner), industry: "이력서·포트폴리오" as const, name: "김하늘", region: "", phone: "", kakao: "" };
    const draft = await saveSite(owner, content, 0);
    await saveSite(owner, draft.draft, draft.revision, slug);
    expect((await getPublicSite(slug))?.content).toEqual(content);
  });
  it("영역별 모양을 초안과 공개본에 독립적으로 보존한다", async () => {
    const owner = uid(), slug = `layout-${crypto.randomUUID().slice(0, 8)}`;
    const content = { ...await validContent(owner), layout: { top: "cover", middle: "gallery", bottom: "banner" } as const };
    const saved = await saveSite(owner, content, 0);
    expect((await getSite(owner)).draft.layout).toEqual(content.layout);
    const published = await saveSite(owner, saved.draft, saved.revision, slug);
    const edited = await saveSite(owner, { ...content, layout: { top: "centered", middle: "story", bottom: "card" } }, published.revision);
    expect((await getPublicSite(slug))?.content.layout).toEqual(content.layout);
    await saveSite(owner, edited.draft, edited.revision, slug);
    expect((await getPublicSite(slug))?.content.layout).toEqual(edited.draft.layout);
    expect((await getPublicSite(slug))?.content.hero).toEqual(content.hero);
  });
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
