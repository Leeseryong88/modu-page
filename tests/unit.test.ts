import { describe, expect, it } from "vitest";
import { COLORS } from "@/lib/brand";
import { contentSchema, EMPTY_CONTENT, imageIds, kakaoUrl, publishIssues, safeHttpUrl, slugError } from "@/lib/schema";
describe("공개 입력 검증", () => {
  it("미완성 초안은 저장할 수 있지만 공개 필수 항목 6개를 안내한다", () => { expect(contentSchema.safeParse(EMPTY_CONTENT).success).toBe(true); expect(publishIssues(EMPTY_CONTENT)).toHaveLength(6); });
  it.each(["api", "dashboard", "signup", "login", "reset-password", "admin", "preview", "examples", "_next", "ab", "a".repeat(31), "-store", "store-", "My-Store", "우리업체", "../foo"])("예약어/잘못된 주소 %s 차단", slug => { expect(slugError(slug)).not.toBeNull(); });
  it.each(["카페", "꽃집", "이사·운송", "인테리어"])("다양한 업종 %s 초안을 저장할 수 있다", industry => { expect(contentSchema.safeParse({ ...EMPTY_CONTENT, industry }).success).toBe(true); });
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
