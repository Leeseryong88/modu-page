import { z } from "zod";
import { DEFAULT_LAYOUT } from "./section-layouts";
export const INDUSTRIES = ["이력서·포트폴리오", "프리랜서·창작자", "전문가·상담", "클래스·교육", "모임·커뮤니티", "행사·프로젝트", "카페", "꽃집", "이사·운송", "인테리어", "도배·장판", "설비", "청소", "기타"] as const;
const text = (max: number) => z.string().trim().max(max, `${max}자 이내로 입력해주세요.`);
export function safeHttpUrl(value: string) {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !!url.hostname && !url.username && !url.password; } catch { return false; }
}
export function kakaoUrl(value: string) {
  if (!safeHttpUrl(value)) return false;
  const { hostname, protocol } = new URL(value);
  return protocol === "https:" && ["pf.kakao.com", "open.kakao.com", "qr.kakao.com"].includes(hostname);
}
const url = text(2000).refine(v => !v || safeHttpUrl(v), "http:// 또는 https://로 시작하는 올바른 주소를 입력해주세요.");
export const imageSchema = z.object({ id: z.string().uuid(), width: z.number().int().positive(), height: z.number().int().positive() }).strict();
export const contentSchema = z.object({
  name: text(30), industry: z.union([z.enum(INDUSTRIES), z.literal("")]), region: text(50), tagline: text(80), about: text(1000),
  phone: text(24).refine(v => !v || /^\+?[\d\s()-]+$/.test(v) && v.replace(/\D/g, "").length >= 8 && v.replace(/\D/g, "").length <= 15, "전화번호를 확인해주세요."),
  kakao: text(2000).refine(v => !v || kakaoUrl(v), "https://로 시작하는 카카오톡 채널 또는 채팅 주소를 입력해주세요."),
  address: text(200), hours: text(100), inquiryEnabled: z.boolean().default(true),
  links: z.array(z.object({ id: z.string().uuid(), label: text(40), url }).strict()).max(3),
  hero: imageSchema.nullable(), logo: imageSchema.nullable(), heroPosition: z.enum(["center", "top", "bottom"]),
  color: z.enum(["navy", "green", "brown", "terracotta", "charcoal"]),
  layout: z.object({
    top: z.enum(["split", "centered", "cover", "editorial"]).default(DEFAULT_LAYOUT.top),
    middle: z.enum(["cards", "gallery", "story", "list"]).default(DEFAULT_LAYOUT.middle),
    bottom: z.enum(["classic", "compact", "card", "banner"]).default(DEFAULT_LAYOUT.bottom),
  }).strict().default(DEFAULT_LAYOUT),
  services: z.array(z.object({ id: z.string().uuid(), title: text(30), description: text(160) }).strict()).max(6),
  projects: z.array(z.object({ id: z.string().uuid(), image: imageSchema.nullable(), title: text(50), description: text(200) }).strict()).max(6),
}).strict();
export type SiteContent = z.infer<typeof contentSchema>;
export type SiteImage = z.infer<typeof imageSchema>;
export const EMPTY_CONTENT: SiteContent = { name: "", industry: "", region: "", tagline: "", about: "", phone: "", kakao: "", address: "", hours: "", inquiryEnabled: true, links: [], hero: null, logo: null, heroPosition: "center", color: "navy", layout: DEFAULT_LAYOUT, services: [], projects: [] };
export const RESERVED_SLUGS = new Set(["api", "dashboard", "login", "signup", "logout", "reset-password", "admin", "www", "mail", "support", "help", "about", "contact", "terms", "privacy", "robots", "sitemap", "favicon", "assets", "images", "static", "auth", "account", "settings", "preview", "examples", "use-cases", "null", "undefined"]);
export function slugError(value: string): string | null {
  if (!/^[a-z0-9](?:[a-z0-9-]{1,28})[a-z0-9]$/.test(value)) return "영문 소문자·숫자·하이픈으로 3~30자, 처음과 끝은 영문 또는 숫자로 입력해주세요.";
  if (RESERVED_SLUGS.has(value)) return "서비스에서 사용 중인 주소예요. 다른 주소를 입력해주세요.";
  return null;
}
export type ValidationIssue = { path: string; message: string; step: number };
export function fieldStep(path: string) { return /^(hero|logo|services|projects)/.test(path) ? 1 : path === "inquiryEnabled" ? 2 : path === "color" ? 3 : path === "slug" ? 4 : 0; }
export function publishIssues(content: SiteContent): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const required = { name: "이름 또는 페이지 이름을 입력해주세요.", industry: "페이지 용도를 선택해주세요.", tagline: "한 줄 소개를 입력해주세요.", hero: "대표 이미지를 등록해주세요." };
  for (const [path, message] of Object.entries(required)) if (!content[path as keyof SiteContent]) issues.push({ path, message, step: fieldStep(path) });
  content.services.forEach((s, i) => { if (!s.title) issues.push({ path: `services.${i}.title`, message: `${i + 1}번째 서비스명을 입력하거나 항목을 삭제해주세요.`, step: 1 }); });
  content.projects.forEach((p, i) => {
    if (!p.title) issues.push({ path: `projects.${i}.title`, message: `${i + 1}번째 사진의 제목을 입력해주세요.`, step: 1 });
    if (!p.image) issues.push({ path: `projects.${i}.image`, message: `${i + 1}번째 사진을 등록하거나 항목을 삭제해주세요.`, step: 1 });
  });
  content.links.forEach((l, i) => { if (!l.label || !l.url) issues.push({ path: `links.${i}.${!l.label ? "label" : "url"}`, message: `${i + 1}번째 외부 링크 이름과 주소를 모두 입력하거나 삭제해주세요.`, step: 0 }); });
  return issues;
}
export function imageIds(content: SiteContent) { return [...new Set([content.hero?.id, content.logo?.id, ...content.projects.map(p => p.image?.id)].filter((s): s is string => !!s))]; }
export type SiteRecord = { ownerId: string; draft: SiteContent; draftSlug: string; published: SiteContent | null; slug: string | null; status: "draft" | "published" | "private"; revision: number; savedAt: string | null; firstPublishedAt: string | null; publishedAt: string | null };
export type PublicSite = { ownerId: string; slug: string; content: SiteContent; firstPublishedAt: string; publishedAt: string };
