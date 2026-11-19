"use client";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Check, CheckCircle2, ChevronDown, ChevronUp, Copy, ExternalLink, Eye, Maximize2, Monitor, Plus, Save, Smartphone, Trash2 } from "lucide-react";
import { COLORS, SITE_ORIGIN } from "@/lib/brand";
import { api, ApiError } from "@/lib/api-client";
import { contentSchema, fieldStep, INDUSTRIES, publishIssues, slugError, type SiteContent, type SiteRecord, type ValidationIssue } from "@/lib/schema";
import { formatDate } from "@/lib/utils";
import { useSite } from "@/hooks/use-site";
import { BrandLogo } from "./site-header";
import { BusinessTemplate } from "./business-template";
import { ImageUpload } from "./image-upload";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
const STEPS = ["기본 정보", "서비스와 사진", "문의하기", "디자인 확인", "주소와 공개"];
function fieldId(path: string) { return `field-${path.replaceAll(".", "-")}`; }
function Field({ path, label, value, onChange, max, required = false, help, placeholder, multiline = false, error, type = "text" }: { path: string; label: string; value: string; onChange: (value: string) => void; max?: number; required?: boolean; help?: string; placeholder?: string; multiline?: boolean; error?: string; type?: string }) {
  const id = fieldId(path); const props = { id, value, onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value), maxLength: max, placeholder, "aria-invalid": !!error, "aria-describedby": `${id}-hint${error ? ` ${id}-error` : ""}` };
  return <div className="field"><label htmlFor={id}>{label}<span className={required ? "required" : "optional"}>{required ? "필수" : "선택"}</span></label>{multiline ? <textarea {...props} rows={5} /> : <input {...props} type={type} />}<div className="field-meta" id={`${id}-hint`}><span>{help}</span>{max && <span>{value.length} / {max}자</span>}</div>{error && <p id={`${id}-error`} className="field-error" role="alert">{error}</p>}</div>;
}
export function Editor() {
  const { site, loading, error, reload } = useSite();
  if (loading) return <div className="state-panel" role="status" aria-busy="true">저장한 내용을 불러오고 있어요…</div>;
  if (error || !site) return <div className="state-panel" role="alert"><p>{error}</p><Button onClick={() => void reload()}>다시 시도</Button></div>;
  return <EditorWorkspace initial={site} />;
}
function EditorWorkspace({ initial }: { initial: SiteRecord }) {
  const [site, setSite] = useState(initial); const [content, setContent] = useState<SiteContent>(initial.draft);
  const [step, setStep] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("step") === "5" ? 4 : 0);
  const [slug, setSlug] = useState(initial.slug || initial.draftSlug || ""); const [slugResult, setSlugResult] = useState<{ value: string; message: string; available: boolean } | null>(null); const [checking, setChecking] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop"); const [mobileView, setMobileView] = useState<"form" | "preview">("form"); const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false); const [uploads, setUploads] = useState(0); const [issues, setIssues] = useState<ValidationIssue[]>([]); const [error, setError] = useState(""); const [notice, setNotice] = useState(""); const [success, setSuccess] = useState(false);
  const [openService, setOpenService] = useState(""); const [openProject, setOpenProject] = useState("");
  const dirty = JSON.stringify(content) !== JSON.stringify(site.draft) || slug !== (site.slug || site.draftSlug || "");
  const onBusy = useCallback((delta: number) => setUploads(n => n + delta), []);
  useEffect(() => {
    if (!dirty && !uploads) return;
    const unload = (e: BeforeUnloadEvent) => { e.preventDefault(); };
    const leave = (e: MouseEvent) => {
      const link = (e.target as Element).closest("a");
      if (!link || link.target === "_blank" || !link.getAttribute("href") || link.getAttribute("href")!.startsWith("#")) return;
      if (!window.confirm("저장하지 않은 변경사항이 있어요. 저장하지 않고 나갈까요?")) { e.preventDefault(); e.stopPropagation(); }
    };
    window.addEventListener("beforeunload", unload); document.addEventListener("click", leave, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", leave, true); };
  }, [dirty, uploads]);
  function update<K extends keyof SiteContent>(key: K, value: SiteContent[K]) { setContent(c => ({ ...c, [key]: value })); setNotice(""); setError(""); setIssues(old => old.filter(i => !i.path.startsWith(key))); }
  function getError(path: string) { return issues.find(i => i.path === path)?.message; }
  function focusIssue(issue: ValidationIssue) {
    setStep(issue.step); setMobileView("form");
    const [group, index] = issue.path.split(".");
    if (group === "services" && index) setOpenService(content.services[Number(index)]?.id);
    if (group === "projects" && index) setOpenProject(content.projects[Number(index)]?.id);
    setTimeout(() => { const field = document.getElementById(fieldId(issue.path)); field?.focus(); field?.scrollIntoView({ block: "center", behavior: "smooth" }); }, 60);
  }
  function validate(publishing: boolean) {
    const parsed = contentSchema.safeParse(content);
    const found: ValidationIssue[] = parsed.success ? [] : parsed.error.issues.map(i => { const path = i.path.join("."); return { path, message: i.message, step: fieldStep(path) }; });
    if (publishing) { found.push(...publishIssues(content)); const message = slugError(slug); if (message) found.push({ path: "slug", message, step: 4 }); }
    setIssues(found);
    return found.length ? null : parsed.success ? parsed.data : null;
  }
  async function save(publishing = false) {
    if (uploads || busy) return;
    const validated = validate(publishing); setError(""); setNotice("");
    if (!validated) { setError(publishing ? "공개 전에 아래 항목을 확인해주세요." : "입력한 내용의 형식을 확인해주세요. 필수 항목은 비워두고 저장할 수 있어요."); return; }
    setBusy(true);
    try {
      const next = await api<SiteRecord>(publishing ? "/api/site/publish" : "/api/site", { method: publishing ? "POST" : "PUT", body: JSON.stringify({ content: validated, revision: site.revision, ...(publishing ? { slug } : { draftSlug: slug }) }) });
      setSite(next); setContent(next.draft); setNotice(publishing ? "홈페이지가 공개되었습니다." : "초안을 저장했어요. 공개된 내용은 바뀌지 않아요."); if (publishing) setSuccess(true);
    } catch (e) { setError((e as Error).message); if (e instanceof ApiError && e.issues) setIssues(e.issues.map(i => ({ ...i, path: i.path.replace(/^content\./, ""), step: i.step ?? fieldStep(i.path.replace(/^content\./, "")) }))); }
    finally { setBusy(false); }
  }
  async function checkSlug() {
    const invalid = slugError(slug); if (invalid) { setSlugResult({ value: slug, message: invalid, available: false }); return; }
    setChecking(true); const value = slug;
    try { const res = await api<{ available: boolean }>(`/api/slugs?slug=${encodeURIComponent(value)}`); setSlugResult({ value, available: res.available, message: res.available ? "사용할 수 있는 주소예요. 공개할 때 최종 확정돼요." : "이미 사용 중인 주소예요. 다른 주소를 입력해주세요." }); }
    catch (e) { setSlugResult({ value, available: false, message: (e as Error).message }); } finally { setChecking(false); }
  }
  function moveItem<K extends "services" | "projects">(key: K, index: number, direction: number) {
    const values = [...content[key]]; [values[index], values[index + direction]] = [values[index + direction], values[index]];
    update(key, values as SiteContent[K]);
  }
  function controls(key: "services" | "projects", i: number) {
    const label = key === "services" ? "서비스" : "사진과 사례";
    return <div className="item-controls"><Button type="button" variant="ghost" size="icon" disabled={i === 0} aria-label={`${i + 1}번째 ${label} 위로 이동`} onClick={() => moveItem(key, i, -1)}><ChevronUp size={18} /></Button><Button type="button" variant="ghost" size="icon" disabled={i === content[key].length - 1} aria-label={`${i + 1}번째 ${label} 아래로 이동`} onClick={() => moveItem(key, i, 1)}><ChevronDown size={18} /></Button><Button type="button" variant="ghost" size="icon" disabled={uploads > 0} aria-label={`${i + 1}번째 ${label} 삭제`} onClick={() => { if (confirm(`${i + 1}번째 ${label}를 초안에서 삭제할까요?`)) update(key, content[key].filter((_, index) => index !== i) as SiteContent[typeof key]); }}><Trash2 size={16} /></Button></div>;
  }
  function basicField(key: "name" | "region" | "tagline" | "about" | "phone" | "kakao" | "address" | "hours", label: string, options: { max?: number; required?: boolean; help?: string; placeholder?: string; multiline?: boolean; type?: string }) {
    return <Field key={key} path={key} label={label} value={content[key]} onChange={value => update(key, value)} error={getError(key)} {...options} />;
  }
  const pending = publishIssues(content);
  const preview = (large = false): ReactNode => <div className={`preview-stage ${device} ${large ? "large" : ""}`}><div className="preview-page"><BusinessTemplate content={content} ownerId={site.ownerId} preview /></div></div>;
  return <div className="editor-page"><header className="editor-header"><BrandLogo /><span className="editor-heading">홈페이지 만들기</span><div className="editor-header-actions"><div className="save-status" aria-live="polite"><strong>{uploads ? "사진 등록 중…" : dirty ? "저장되지 않은 변경사항" : site.savedAt ? "모든 변경사항 저장됨" : "아직 저장하지 않았어요"}</strong>{site.savedAt && <span>마지막 저장 {formatDate(site.savedAt)}</span>}</div><Button variant="outline" size="sm" onClick={() => void save()} disabled={busy || uploads > 0}><Save size={16} />{busy ? "처리 중…" : "임시저장"}</Button><Link href="/dashboard" className="editor-exit">관리 화면</Link></div></header>
    <nav className="editor-steps" aria-label="홈페이지 작성 단계">{STEPS.map((name, i) => <button key={name} aria-current={step === i ? "step" : undefined} onClick={() => { setStep(i); setMobileView("form"); }}><span>{i + 1}</span><strong>{name}</strong></button>)}</nav><div className="mobile-editor-tabs"><button aria-pressed={mobileView === "form"} onClick={() => setMobileView("form")}>정보 입력</button><button aria-pressed={mobileView === "preview"} onClick={() => setMobileView("preview")}>미리보기</button></div>
    <main id="main" className={`editor-layout show-${mobileView}`}><section className="editor-form-panel"><div className="step-heading"><span className="eyebrow">{step + 1} / {STEPS.length} 단계</span><h1>{["어떤 일을 하는 업체인가요?", "사진으로 우리 일을 보여주세요.", "온라인으로 문의를 받을까요?", "우리 업체의 모습을 확인해요.", "이제, 고객을 만날 준비를 해요."][step]}</h1><p>{["고객이 궁금해할 기본 정보를 알려주세요.", "선택 항목은 나중에 채워도 괜찮아요.", "고객이 홈페이지에서 문의를 남길 수 있도록 선택해주세요.", "마음에 드는 색상을 고르고 화면을 확인해주세요.", "주소를 정하고 마지막으로 내용을 확인해주세요."][step]}</p></div>
    <fieldset disabled={busy} className="editor-fieldset">
    {step === 0 && <>
      {basicField("name", "업체명", { required: true, max: 30, placeholder: "예: 모로커피" })}
      <div className="field"><label htmlFor={fieldId("industry")}>업종<span className="required">필수</span></label><select id={fieldId("industry")} value={content.industry} onChange={e => update("industry", e.target.value as SiteContent["industry"])} aria-invalid={!!getError("industry")}><option value="">업종을 선택해주세요</option>{INDUSTRIES.map(i => <option key={i}>{i}</option>)}</select>{getError("industry") && <p className="field-error">{getError("industry")}</p>}</div>
      {basicField("region", "활동 지역", { required: true, max: 50, help: "가게가 있는 곳이나 서비스 가능한 지역을 적어주세요.", placeholder: "예: 수원·용인·화성" })}
      {basicField("tagline", "한 줄 소개", { required: true, max: 80, help: "어떤 가게인지, 어떤 서비스를 제공하는지 소개해주세요.", placeholder: "예: 동네의 하루에, 커피 한 잔의 여유." })}
      {basicField("about", "상세 소개", { max: 1000, multiline: true, help: "가게의 이야기, 상품이나 서비스의 특징을 알려주세요.", placeholder: "업체의 전문 분야와 일하는 방식을 알려주세요." })}
      <div className="form-section-title"><h2>고객이 연락할 수 있도록</h2><p>전화번호만 있어도 문의를 받을 수 있어요.</p></div>
      {basicField("phone", "전화번호", { required: true, type: "tel", placeholder: "예: 010-1234-5678", max: 24 })}
      {basicField("kakao", "카카오톡 상담 URL", { type: "url", help: "고객이 상담할 수 있는 카카오톡 채널 또는 채팅 링크를 넣어주세요.", placeholder: "예: https://pf.kakao.com/채널주소", max: 2000 })}
      {basicField("address", "주소", { max: 200, placeholder: "고객에게 안내할 업체 주소" })}
      {basicField("hours", "영업시간", { max: 100, placeholder: "예: 평일 09:00–18:00, 일요일 휴무" })}
      <div className="form-section-title"><h2>외부 링크<span className="optional">선택 · 최대 3개</span></h2><p>블로그 등 우리 업체를 더 알 수 있는 주소를 넣어주세요.</p></div>
      {content.links.map((l, i) => <div key={l.id} className="repeater-item"><Field path={`links.${i}.label`} label="링크 이름" value={l.label} onChange={v => update("links", content.links.map(x => x.id === l.id ? { ...x, label: v } : x))} max={40} placeholder="예: 업체 블로그" error={getError(`links.${i}.label`)} /><Field path={`links.${i}.url`} label="링크 주소" type="url" value={l.url} onChange={v => update("links", content.links.map(x => x.id === l.id ? { ...x, url: v } : x))} placeholder="https://" error={getError(`links.${i}.url`)} /><Button variant="ghost" size="sm" onClick={() => update("links", content.links.filter(x => x.id !== l.id))}><Trash2 size={15} />링크 삭제</Button></div>)}
      {content.links.length < 3 && <Button variant="outline" className="full-width" onClick={() => update("links", [...content.links, { id: crypto.randomUUID(), label: "", url: "" }])}><Plus size={17} />외부 링크 추가</Button>}
    </>}
    {step === 1 && <>
      <div className="field"><label>대표 이미지<span className="required">공개 시 필수</span></label><p className="field-hint">가게, 상품, 작업 모습을 잘 보여주는 사진을 올려주세요. 가로 사진을 권장해요.</p><ImageUpload label="대표 이미지" value={content.hero} ownerId={site.ownerId} onChange={v => update("hero", v)} onBusy={onBusy} position={content.heroPosition} inputId={fieldId("hero")} error={getError("hero")} /></div>
      {content.hero && <div className="field"><label htmlFor="hero-position">사진에서 보여줄 부분</label><select id="hero-position" value={content.heroPosition} onChange={e => update("heroPosition", e.target.value as SiteContent["heroPosition"])}><option value="center">중앙</option><option value="top">위쪽</option><option value="bottom">아래쪽</option></select><p className="field-hint">위의 사진과 실제 홈페이지에 같은 위치로 적용돼요.</p></div>}
      <details className="optional-section"><summary>로고 등록<span className="optional">선택</span></summary><p className="field-hint">로고가 없으면 업체명이 텍스트 로고로 보여요.</p><ImageUpload label="로고" value={content.logo} ownerId={site.ownerId} onChange={v => update("logo", v)} onBusy={onBusy} logo inputId={fieldId("logo")} /></details>
      <div className="form-section-title"><h2>메뉴·상품·서비스<span className="optional">선택 · 최대 6개</span></h2><p>대표 메뉴, 상품 또는 제공 서비스를 소개해주세요.</p></div>
      {content.services.map((s, i) => <div key={s.id} className="repeater-item"><div className="repeater-heading"><button className="item-title" aria-expanded={openService === s.id} onClick={() => setOpenService(openService === s.id ? "" : s.id)}>{s.title || `서비스 ${i + 1}`}<ChevronDown size={16} /></button>{controls("services", i)}</div>{openService === s.id && <div className="repeater-body"><Field path={`services.${i}.title`} label="서비스명" value={s.title} onChange={v => update("services", content.services.map(x => x.id === s.id ? { ...x, title: v } : x))} max={30} placeholder="예: 시그니처 커피 / 포장이사" error={getError(`services.${i}.title`)} /><Field path={`services.${i}.description`} label="서비스 설명" value={s.description} onChange={v => update("services", content.services.map(x => x.id === s.id ? { ...x, description: v } : x))} max={160} multiline placeholder="상품이나 서비스의 특징을 간단하게 알려주세요." error={getError(`services.${i}.description`)} /></div>}</div>)}
      {content.services.length < 6 && <Button variant="outline" className="full-width" onClick={() => { const id = crypto.randomUUID(); update("services", [...content.services, { id, title: "", description: "" }]); setOpenService(id); }}><Plus size={17} />서비스 추가 ({content.services.length}/6)</Button>}
      <div className="form-section-title"><h2>사진과 사례<span className="optional">선택 · 최대 6개</span></h2><p>가게 공간, 상품, 작업 사례의 사진과 이야기를 보여주세요.</p></div>
      {content.projects.map((p, i) => <div key={p.id} className="repeater-item"><div className="repeater-heading"><button className="item-title" aria-expanded={openProject === p.id} onClick={() => setOpenProject(openProject === p.id ? "" : p.id)}>{p.title || `사진 ${i + 1}`}<ChevronDown size={16} /></button>{controls("projects", i)}</div>{openProject === p.id && <div className="repeater-body"><ImageUpload label={`${i + 1}번째 소개 사진`} value={p.image} ownerId={site.ownerId} onChange={v => setContent(c => ({ ...c, projects: c.projects.map(x => x.id === p.id ? { ...x, image: v } : x) }))} onBusy={onBusy} inputId={fieldId(`projects.${i}.image`)} error={getError(`projects.${i}.image`)} /><Field path={`projects.${i}.title`} label="사진 제목" value={p.title} onChange={v => update("projects", content.projects.map(x => x.id === p.id ? { ...x, title: v } : x))} max={50} placeholder="예: 창가 자리 / 계절 꽃다발 / 이사 현장" error={getError(`projects.${i}.title`)} /><Field path={`projects.${i}.description`} label="사진 설명" value={p.description} onChange={v => update("projects", content.projects.map(x => x.id === p.id ? { ...x, description: v } : x))} max={200} multiline placeholder="사진에 담긴 상품, 공간, 서비스를 소개해주세요." error={getError(`projects.${i}.description`)} /></div>}</div>)}
      {content.projects.length < 6 && <Button variant="outline" className="full-width" onClick={() => { const id = crypto.randomUUID(); update("projects", [...content.projects, { id, title: "", description: "", image: null }]); setOpenProject(id); }}><Plus size={17} />사진 추가 ({content.projects.length}/6)</Button>}
      <p className="photo-notice">고객에게 공개해도 되는 사진을 사용하고, 얼굴이나 상세 주소 등 공개하고 싶지 않은 정보가 없는지 확인해주세요.</p>
    </>}
    {step === 2 && <><fieldset className="inquiry-options"><legend>문의하기 기능</legend>{[{ enabled: true, title: "문의하기 사용", description: "고객이 이름, 연락처, 문의 내용을 남길 수 있어요. 접수한 내용은 문의함에서 확인해요." }, { enabled: false, title: "문의하기 사용 안 함", description: "문의 작성 양식을 표시하지 않아요. 전화와 카카오톡 연락 버튼은 그대로 사용할 수 있어요." }].map(option => <label key={String(option.enabled)} className={((content.inquiryEnabled !== false) === option.enabled) ? "selected" : ""}><input type="radio" name="inquiryEnabled" checked={(content.inquiryEnabled !== false) === option.enabled} onChange={() => update("inquiryEnabled", option.enabled)} /><span><strong>{option.title}</strong><span>{option.description}</span></span></label>)}</fieldset><p className="notice">설정은 홈페이지를 공개하거나 공개 내용을 업데이트할 때 적용돼요. 사용을 중단해도 이전에 받은 문의와 집계는 문의함에 남아 있어요.</p></>}
    {step === 3 && <><div className="field"><label>우리 업체의 포인트 색상</label><p className="field-hint">주요 버튼과 작은 강조 요소에 적용돼요.</p><div className="color-options" role="group" aria-label="포인트 색상">{Object.entries(COLORS).map(([key, color]) => <button key={key} aria-pressed={content.color === key} onClick={() => update("color", key as SiteContent["color"])}><span style={{ backgroundColor: color.value }}>{content.color === key && <Check size={20} />}</span>{color.name}</button>)}</div></div><div className="design-checklist"><h2>고객의 시선으로 확인해보세요.</h2><p><CheckCircle2 size={18} />어떤 일을 하는 업체인지 잘 보이나요?</p><p><CheckCircle2 size={18} />사진에서 중요한 부분이 잘리지 않았나요?</p><p><CheckCircle2 size={18} />연락처와 활동 지역이 정확한가요?</p><Button variant="outline" onClick={() => setExpanded(true)}><Maximize2 size={16} />크게 미리보기</Button></div><div className="edit-shortcuts"><Button variant="ghost" onClick={() => setStep(0)}>기본 정보 수정하기</Button><Button variant="ghost" onClick={() => setStep(1)}>서비스와 사진 수정하기</Button></div></>}
    {step === 4 && <><div className="field"><label htmlFor={fieldId("slug")}>홈페이지 주소<span className="required">필수</span></label><div className="slug-input"><span>{new URL(SITE_ORIGIN).host}/</span><input id={fieldId("slug")} value={slug} maxLength={30} disabled={!!site.slug} onChange={e => { setSlug(e.target.value); setSlugResult(null); }} placeholder="my-business" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-describedby="slug-help" /></div><p className="field-hint" id="slug-help">영문 소문자·숫자·하이픈 3~30자. 처음과 끝에는 하이픈을 사용할 수 없어요.</p><p className="full-address">{SITE_ORIGIN}/{slug || "내-주소"}</p>{site.slug ? <p className="notice compact">최초 공개한 주소는 변경할 수 없어요.</p> : <Button variant="outline" onClick={() => void checkSlug()} disabled={checking || !slug}>{checking ? "확인 중…" : "사용 가능 여부 확인"}</Button>}{slugResult?.value === slug && <p className={slugResult.available ? "field-success" : "field-error"} role="status">{slugResult.message}</p>}{getError("slug") && <p className="field-error">{getError("slug")}</p>}</div><div className="publish-checklist"><h2>공개 전 확인해주세요.</h2>{[{ key: "name", label: "업체명" }, { key: "industry", label: "업종" }, { key: "region", label: "활동 지역" }, { key: "tagline", label: "한 줄 소개" }, { key: "phone", label: "전화번호" }, { key: "hero", label: "대표 이미지" }].map(({ key, label }) => <button key={key} onClick={() => focusIssue({ path: key, step: fieldStep(key), message: "" })}><span className={content[key as keyof SiteContent] ? "check-complete" : "check-pending"}>{content[key as keyof SiteContent] ? <Check size={16} /> : "·"}</span>{label}<span>{content[key as keyof SiteContent] ? "입력 완료" : "입력하기"}</span></button>)}</div><div className="publish-notice"><h3>공개하면 이렇게 보여요.</h3><p>누구나 내 홈페이지 주소로 방문할 수 있어요. 주소를 복사해 카카오톡이나 SNS에 공유해보세요.</p><p>최초 공개 후에는 주소를 바꿀 수 없어요. 필요할 때 홈페이지를 비공개로 전환할 수 있어요.</p>{site.status === "private" && <strong>다시 공개할 때는 현재 초안을 검증하고 공개해요.</strong>}</div><p className="field-hint">필수 정보 {6 - pending.filter(i => ["name", "industry", "region", "tagline", "phone", "hero"].includes(i.path)).length} / 6개 입력 완료</p></>}
    </fieldset>
    {(error || issues.length > 0) && <div className="editor-errors" role="alert"><h2>{error || "아래 항목을 확인해주세요."}</h2>{issues.length > 0 && <ul>{issues.map((issue, i) => <li key={`${issue.path}-${i}`}><button onClick={() => focusIssue(issue)}>{issue.message}</button></li>)}</ul>}</div>}{notice && <p className="feedback success" role="status"><Check size={18} />{notice}</p>}
    <div className="editor-bottom"><Button variant="outline" disabled={step === 0 || busy} onClick={() => { setStep(step - 1); setMobileView("form"); }}>이전</Button><span>{step + 1} / {STEPS.length}</span>{step < STEPS.length - 1 ? <Button onClick={() => { setStep(step + 1); setMobileView("form"); }} disabled={busy}>다음 단계</Button> : <Button onClick={() => void save(true)} disabled={busy || uploads > 0}>{uploads ? "사진 등록 중…" : busy ? "공개 중…" : site.status === "published" ? "공개 내용 업데이트" : "홈페이지 공개"}</Button>}</div><p className="step-save-note">단계를 이동해도 내용은 유지돼요. 보관하려면 임시저장을 눌러주세요.</p>
    </section><aside className="editor-preview-panel"><div className="preview-toolbar"><span><Eye size={16} />실시간 미리보기</span><div><button aria-label="데스크톱 미리보기" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}><Monitor size={18} /></button><button aria-label="모바일 미리보기" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}><Smartphone size={18} /></button><button aria-label="미리보기 크게 보기" onClick={() => setExpanded(true)}><Maximize2 size={18} /></button></div></div>{preview()}<p className="preview-hint">현재 초안이에요. 연락 버튼을 누르면 연결될 주소를 확인할 수 있어요.</p></aside></main>
    <Dialog open={expanded} onOpenChange={setExpanded}><DialogContent className="preview-dialog"><DialogTitle className="sr-only">현재 초안 미리보기</DialogTitle><DialogDescription className="sr-only">공개 화면과 같은 템플릿으로 현재 입력한 내용을 보여줍니다.</DialogDescription><div className="preview-dialog-tools"><Button size="sm" variant={device === "desktop" ? "default" : "outline"} onClick={() => setDevice("desktop")}><Monitor size={16} />데스크톱</Button><Button size="sm" variant={device === "mobile" ? "default" : "outline"} onClick={() => setDevice("mobile")}><Smartphone size={16} />모바일</Button></div>{preview(true)}</DialogContent></Dialog>
    <Dialog open={success} onOpenChange={setSuccess}><DialogContent><div className="publish-success-icon"><CheckCircle2 size={32} /></div><DialogTitle>홈페이지가 공개되었습니다.</DialogTitle><DialogDescription>우리 업체의 새로운 공간이 열렸어요. 아래 주소를 고객에게 알려주세요.</DialogDescription><p className="success-url selectable">{SITE_ORIGIN}/{site.slug}</p><div className="dialog-actions"><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(`${SITE_ORIGIN}/${site.slug}`); setNotice("주소를 복사했어요."); } catch { setNotice("표시된 주소를 직접 선택해 복사해주세요."); } }}><Copy size={16} />주소 복사</Button><Button asChild><a href={`/${site.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />홈페이지 열기</a></Button></div><Button variant="ghost" className="full-width" onClick={() => setSuccess(false)}>계속 수정하기</Button><p role="status" className="field-hint">{notice}</p></DialogContent></Dialog>
  </div>;
}
