import { describe, expect, it } from "vitest";
import { COLORS } from "@/lib/brand";
import { authReturnPath, exampleEditorHref } from "@/lib/start-path";
import { EXAMPLES } from "@/lib/examples";
import { getExampleStory } from "@/lib/example-stories";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { DEFAULT_LAYOUT, SECTION_TEMPLATES, sectionForField } from "@/lib/section-layouts";
import { contentSchema, EMPTY_CONTENT, imageIds, kakaoUrl, publishIssues, safeHttpUrl, slugError } from "@/lib/schema";
describe("선택한 예시로 로그인 후 돌아가기", () => {
  it("로그인 전후 예시 선택을 유지한다", () => {
    expect(authReturnPath(exampleEditorHref("workshop"))).toBe("/dashboard/editor?example=workshop");
    expect(authReturnPath("/dashboard/inquiries?status=new")).toBe("/dashboard/inquiries?status=new");
  });
  it.each(["https://evil.example", "//evil.example/dashboard", "/\\evil.example", "/dashboard/../../signup", "/signup", ["/dashboard"], null, "/dashboard\n"])("외부 주소와 잘못된 경로를 사용하지 않는다: %s", value => {
    expect(authReturnPath(value)).toBe("/dashboard");
  });
});
describe("예시 홈페이지의 콘텐츠 품질", () => {
  it("네 카테고리마다 둘 이상의 홈페이지를 제공한다", () => {
    for (const audience of ["개인·창작자", "전문가", "클래스·모임", "매장·비즈니스"]) expect(EXAMPLES.filter(example => example.audience === audience).length).toBeGreaterThanOrEqual(2);
  });
  it.each(EXAMPLES)("$slug의 대표·상세 사진은 서로 다르고 실제 파일과 활용 설명이 존재한다", example => {
    const sources = [example.imageSources[example.content.hero!.id], ...example.content.projects.map(project => example.imageSources[project.image!.id])];
    expect(example.content.projects.length).toBeGreaterThanOrEqual(3);
    expect(new Set(sources).size).toBe(sources.length);
    for (const source of sources) expect(existsSync(resolve("public", source.slice(1)))).toBe(true);
    const story = getExampleStory(example);
    expect(story.scene.name).toBe(example.content.name);
    expect(story.usage.length).toBeGreaterThan(10);
  });
  it("서로 다른 예시의 대표·상세 사진도 돌려 쓰지 않는다", () => {
    const sources = EXAMPLES.flatMap(example => Object.values(example.imageSources));
    expect(new Set(sources).size).toBe(sources.length);
  });
});
describe("공개 입력 검증", () => {
  it("개인 페이지는 전화번호와 지역을 공개하지 않고도 게시할 수 있다", () => {
    const content = { ...EMPTY_CONTENT, name: "나의 포트폴리오", industry: "이력서·포트폴리오" as const, tagline: "작업과 경험", hero: { id: crypto.randomUUID(), width: 1200, height: 800 } };
    expect(publishIssues(content)).toEqual([]);
    expect(publishIssues({ ...content, inquiryEnabled: false })).toEqual([]);
    expect(contentSchema.safeParse({ ...content, phone: "잘못된 번호" }).success).toBe(false);
  });
  it.each(EXAMPLES)("$slug 예시가 실제 편집·공개 규칙과 일치한다", example => {
    expect(contentSchema.safeParse(example.content).success).toBe(true);
    expect(publishIssues(example.content)).toEqual([]);
    expect(imageIds(example.content).every(id => !!example.imageSources[id])).toBe(true);
  });
  it("미완성 초안은 저장할 수 있지만 공개 필수 항목 4개를 안내한다", () => { expect(contentSchema.safeParse(EMPTY_CONTENT).success).toBe(true); expect(publishIssues(EMPTY_CONTENT)).toHaveLength(4); });
  it.each(["api", "dashboard", "signup", "login", "reset-password", "admin", "preview", "examples", "use-cases", "_next", "ab", "a".repeat(31), "-store", "store-", "My-Store", "우리업체", "../foo"])("예약어/잘못된 주소 %s 차단", slug => { expect(slugError(slug)).not.toBeNull(); });
  it.each(["카페", "꽃집", "이사·운송", "인테리어", "이력서·포트폴리오", "프리랜서·창작자", "전문가·상담", "클래스·교육", "모임·커뮤니티", "행사·프로젝트"])("다양한 업종 %s 초안을 저장할 수 있다", industry => { expect(contentSchema.safeParse({ ...EMPTY_CONTENT, industry }).success).toBe(true); });
  it.each(["my-store", "abc", "123", "a".repeat(30)])("정상 주소 %s 허용", slug => { expect(slugError(slug)).toBeNull(); });
  it.each(["javascript:alert(1)", "data:text/html,x", "//evil.test", "https://name:password@example.com", "file:///tmp/a"])("위험한 링크 차단 %s", url => { expect(safeHttpUrl(url)).toBe(false); });
  it("카카오 링크의 호스트와 프로토콜 검증", () => { expect(kakaoUrl("https://pf.kakao.com/_test")).toBe(true); expect(kakaoUrl("https://pf.kakao.com.attacker.test")).toBe(false); expect(kakaoUrl("http://pf.kakao.com/a")).toBe(false); });
  it("선택 항목을 추가했다면 빈 서비스/작업/링크를 공개하지 않는다", () => { const c = { ...EMPTY_CONTENT, services: [{ id: crypto.randomUUID(), title: "", description: "" }], projects: [{ id: crypto.randomUUID(), title: "", description: "", image: null }], links: [{ id: crypto.randomUUID(), label: "", url: "" }] }; expect(publishIssues(c).map(i => i.path)).toEqual(expect.arrayContaining(["services.0.title", "projects.0.title", "projects.0.image", "links.0.label"])); });
  it("최대 길이/최대 개수를 서버 스키마로 제한한다", () => { expect(contentSchema.safeParse({ ...EMPTY_CONTENT, name: "가".repeat(31) }).success).toBe(false); expect(contentSchema.safeParse({ ...EMPTY_CONTENT, projects: Array.from({ length: 7 }, () => ({ id: crypto.randomUUID(), title: "사례", description: "", image: null })) }).success).toBe(false); });
  it("이미지 참조를 중복 없이 모은다", () => { const image = { id: crypto.randomUUID(), width: 800, height: 600 }; expect(imageIds({ ...EMPTY_CONTENT, hero: image, logo: image })).toEqual([image.id]); });
  it("모든 포인트 버튼은 흰 글씨와 WCAG AA 대비를 충족한다", () => {
    for (const color of Object.values(COLORS)) { const rgb = color.value.slice(1).match(/../g)!.map(x => parseInt(x, 16) / 255).map(x => x <= .04045 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4); const lum = .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2]; expect(1.05 / (lum + .05)).toBeGreaterThanOrEqual(4.5); }
  });
});

describe("온라인 문의 설정", () => {
  it("기존 홈페이지에는 문의 기능을 유지하고 명시적인 비활성 설정을 보존한다", () => {
    const legacy = { ...EMPTY_CONTENT }; delete (legacy as Partial<typeof EMPTY_CONTENT>).inquiryEnabled;
    expect(contentSchema.parse(legacy).inquiryEnabled).toBe(true);
    expect(contentSchema.parse({ ...EMPTY_CONTENT, inquiryEnabled: false }).inquiryEnabled).toBe(false);
    expect(contentSchema.safeParse({ ...EMPTY_CONTENT, inquiryEnabled: "false" }).success).toBe(false);
  });
});

describe("상단·중단·하단 조립", () => {
  it("기존 저장 데이터와 부분 설정에 기본 모양을 채운다", () => {
    const { layout: _layout, ...legacy } = EMPTY_CONTENT;
    expect(contentSchema.parse(legacy).layout).toEqual(DEFAULT_LAYOUT);
    expect(contentSchema.parse({ ...legacy, layout: { top: "cover" } }).layout).toEqual({ ...DEFAULT_LAYOUT, top: "cover" });
  });
  it("64가지 조합을 저장해도 입력 내용과 이미지 참조를 유지한다", () => {
    const hero = { id: crypto.randomUUID(), width: 1000, height: 800 };
    const original = { ...EMPTY_CONTENT, name: "모로커피", hero, about: "우리 가게 소개", services: [{ id: crypto.randomUUID(), title: "커피", description: "오늘의 커피" }], inquiryEnabled: false };
    for (const top of SECTION_TEMPLATES.top) for (const middle of SECTION_TEMPLATES.middle) for (const bottom of SECTION_TEMPLATES.bottom) {
      const layout = { top: top.id, middle: middle.id, bottom: bottom.id };
      expect(contentSchema.parse({ ...original, layout })).toEqual({ ...original, layout });
    }
  });
  it("지원하지 않는 템플릿과 다른 영역의 템플릿을 거부한다", () => {
    expect(contentSchema.safeParse({ ...EMPTY_CONTENT, layout: { ...DEFAULT_LAYOUT, top: "gallery" } }).success).toBe(false);
    expect(contentSchema.safeParse({ ...EMPTY_CONTENT, layout: { ...DEFAULT_LAYOUT, middle: "unknown" } }).success).toBe(false);
  });
  it.each([["hero", "top"], ["name", "top"], ["region", "top"], ["about", "middle"], ["services.2.title", "middle"], ["projects.1.image", "middle"], ["phone", "bottom"], ["links.0.url", "bottom"], ["inquiryEnabled", "bottom"], ["layout.bottom", "bottom"]])("검증 항목 %s를 %s 편집창에 연결한다", (path, section) => { expect(sectionForField(path)).toBe(section); });
});
