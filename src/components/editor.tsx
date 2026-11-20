"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, Copy, ExternalLink, Eye, Layers3, Monitor, Palette, Pencil, Save, Smartphone } from "lucide-react";
import { COLORS, SITE_ORIGIN } from "@/lib/brand";
import { api, ApiError } from "@/lib/api-client";
import { contentSchema, fieldStep, publishIssues, slugError, type SiteContent, type SiteRecord, type ValidationIssue } from "@/lib/schema";
import { DEFAULT_LAYOUT, SECTION_INFO, SECTION_TEMPLATES, sectionForField, type SiteSection } from "@/lib/section-layouts";
import { formatDate } from "@/lib/utils";
import { useSite } from "@/hooks/use-site";
import { BrandLogo } from "./site-header";
import { BusinessTemplate } from "./business-template";
import { SectionFields, fieldId } from "./section-fields";
import { SectionTemplatePicker } from "./section-template-picker";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import "./editor.css";

const REGIONS: SiteSection[] = ["top", "middle", "bottom"];
function withLayout(content: SiteContent): SiteContent { return { ...content, layout: { ...DEFAULT_LAYOUT, ...content.layout } }; }
function inputIssues(content: SiteContent) {
  const result = contentSchema.safeParse(content);
  return result.success ? [] : result.error.issues.map(i => ({ path: i.path.join("."), message: i.message, step: fieldStep(i.path.join(".")) }));
}
export function Editor() {
  const { site, loading, error, reload } = useSite();
  if (loading) return <div className="state-panel" role="status" aria-busy="true">저장한 내용을 불러오고 있어요…</div>;
  if (error || !site) return <div className="state-panel" role="alert"><p>{error}</p><Button onClick={() => void reload()}>다시 시도</Button></div>;
  return <EditorWorkspace initial={site} />;
}
function EditorWorkspace({ initial }: { initial: SiteRecord }) {
  const [site, setSite] = useState(initial);
  const [content, setContent] = useState(() => withLayout(initial.draft));
  const [draft, setDraft] = useState(content);
  const [section, setSection] = useState<SiteSection | null>(null);
  const [tab, setTab] = useState<"content" | "template">("content");
  const [focusPath, setFocusPath] = useState("");
  const [slug, setSlug] = useState(initial.slug || initial.draftSlug || "");
  const [slugResult, setSlugResult] = useState<{ value: string; message: string; available: boolean } | null>(null);
  const [checking, setChecking] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  const [preview, setPreview] = useState(false);
  const [publishOpen, setPublishOpen] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).get("step") === "5");
  const [colorOpen, setColorOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [modalIssues, setModalIssues] = useState<ValidationIssue[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const dialogBody = useRef<HTMLDivElement>(null);
  const dirty = JSON.stringify(content) !== JSON.stringify(withLayout(site.draft)) || slug !== (site.slug || site.draftSlug || "");
  const modalDirty = section !== null && JSON.stringify(draft) !== JSON.stringify(content);
  const onBusy = useCallback((delta: number) => setUploads(n => n + delta), []);
  useEffect(() => { if (dialogBody.current) dialogBody.current.scrollTop = 0; }, [section, tab]);
  useEffect(() => {
    if (!dirty && !modalDirty && !uploads) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const leave = (event: MouseEvent) => {
      const link = (event.target as Element).closest("a");
      if (!link || link.target === "_blank" || !link.getAttribute("href") || link.getAttribute("href")!.startsWith("#")) return;
      if (!window.confirm("저장하지 않은 변경사항이 있어요. 저장하지 않고 나갈까요?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", unload); document.addEventListener("click", leave, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", leave, true); };
  }, [dirty, modalDirty, uploads]);
  useEffect(() => {
    if (!section || tab !== "content" || !focusPath) return;
    const timer = setTimeout(() => {
      const field = document.getElementById(fieldId(focusPath));
      const details = field?.closest("details"); if (details) details.open = true;
      field?.focus(); field?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 100);
    return () => clearTimeout(timer);
  }, [section, tab, focusPath]);
  function rememberFocus() { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }
  function openSection(next: SiteSection, path = "") {
    if (busy) return;
    rememberFocus(); setDraft(content); setModalIssues(issues.filter(i => sectionForField(i.path) === next));
    setFocusPath(path); setTab("content"); setSection(next); setPublishOpen(false); setNotice("");
  }
  function closeSection() { if (!uploads) { setSection(null); setModalIssues([]); } }
  function applySection() {
    if (!section || uploads) return;
    const found = inputIssues(draft).filter(i => sectionForField(i.path) === section);
    setModalIssues(found);
    if (found.length) { setTab("content"); setFocusPath(found[0].path); return; }
    setContent(draft); setIssues(old => old.filter(i => sectionForField(i.path) !== section)); setError("");
    setNotice(`${SECTION_INFO[section].label}을 적용했어요. 임시저장을 눌러 보관해주세요.`); closeSection();
  }
  function focusIssue(issue: ValidationIssue) {
    if (issue.path === "slug") { setPublishOpen(true); setTimeout(() => document.getElementById(fieldId("slug"))?.focus(), 100); }
    else openSection(sectionForField(issue.path), issue.path);
  }
  async function save(publishing = false) {
    if (uploads || busy) return;
    const found = inputIssues(content);
    if (publishing) { found.push(...publishIssues(content)); const message = slugError(slug); if (message) found.push({ path: "slug", message, step: 4 }); }
    setIssues(found); setError(""); setNotice("");
    if (found.length) { setError("입력한 내용을 확인해주세요."); if (publishing) setPublishOpen(true); else focusIssue(found[0]); return; }
    setBusy(true);
    try {
      const next = await api<SiteRecord>(publishing ? "/api/site/publish" : "/api/site", { method: publishing ? "POST" : "PUT", body: JSON.stringify({ content: contentSchema.parse(content), revision: site.revision, ...(publishing ? { slug } : { draftSlug: slug }) }) });
      setSite(next); setContent(withLayout(next.draft)); setNotice(publishing ? "홈페이지가 공개되었습니다." : "초안을 저장했어요. 공개된 내용은 바뀌지 않아요.");
      if (publishing) { setPublishOpen(false); setSuccess(true); }
    } catch (e) { setError((e as Error).message); if (e instanceof ApiError && e.issues) setIssues(e.issues.map(i => ({ ...i, path: i.path.replace(/^content\./, ""), step: i.step ?? fieldStep(i.path.replace(/^content\./, "")) }))); }
    finally { setBusy(false); }
  }
  async function checkSlug() {
    const invalid = slugError(slug); if (invalid) { setSlugResult({ value: slug, message: invalid, available: false }); return; }
    setChecking(true); const value = slug;
    try { const result = await api<{ available: boolean }>(`/api/slugs?slug=${encodeURIComponent(value)}`); setSlugResult({ value, available: result.available, message: result.available ? "사용할 수 있는 주소예요. 공개할 때 확정돼요." : "이미 사용 중인 주소예요. 다른 주소를 입력해주세요." }); }
    catch (e) { setSlugResult({ value, available: false, message: (e as Error).message }); } finally { setChecking(false); }
  }
  const pending = publishIssues(content);
  const feedback = error && <div className="editor-errors" role="alert"><h2>{error}</h2>{issues.length > 0 && <ul>{issues.map((issue, i) => <li key={`${issue.path}-${i}`}><button onClick={() => focusIssue(issue)}>{issue.message}</button></li>)}</ul>}</div>;
  return <div className="assembly-editor">
    <header className="assembly-header"><BrandLogo /><span className="assembly-heading">홈페이지 편집</span><div className="assembly-header-actions">
      <div className="assembly-save-status" role="status"><strong>{busy ? "저장 중…" : uploads ? "사진 등록 중…" : dirty ? "저장할 변경사항이 있어요" : site.savedAt ? "저장 완료" : "첫 홈페이지를 만들어보세요"}</strong>{site.savedAt && <span>마지막 저장 {formatDate(site.savedAt)}</span>}</div>
      <Button variant="outline" size="sm" onClick={() => void save()} disabled={busy || uploads > 0}><Save size={16} />임시저장</Button><Button size="sm" onClick={() => { rememberFocus(); setPublishOpen(true); }} disabled={busy}>공개하기</Button><Link href="/dashboard" className="assembly-exit">관리 화면</Link>
    </div></header>
    <main id="main" className="assembly-main">
      <div className="assembly-intro"><div><span className="assembly-eyebrow"><Layers3 size={16} />세 부분으로 완성하는 우리 홈페이지</span><h1>누르고, 고르고, 채워보세요.</h1><p>바꾸고 싶은 영역을 누르면 편집창이 열려요. 상단·중단·하단을 내 취향대로 조립해보세요.</p></div><Button variant="outline" onClick={() => { rememberFocus(); setColorOpen(true); }} disabled={busy}><Palette size={17} />전체 색상</Button></div>
      <nav className="assembly-sections" aria-label="편집할 영역 선택">{REGIONS.map(region => {
        const missing = pending.filter(issue => sectionForField(issue.path) === region).length;
        return <button key={region} onClick={() => openSection(region)} disabled={busy} aria-label={`${SECTION_INFO[region].label} 편집`}><span className={`section-stack stack-${region}`} aria-hidden="true"><i /><i /><i /></span><span><strong>{SECTION_INFO[region].label}<span>{SECTION_INFO[region].contents}</span></strong><small>{SECTION_TEMPLATES[region].find(t => t.id === content.layout[region])?.name}</small></span><span className="section-state">{missing ? `${missing}개 입력 필요` : region === "middle" && !content.about && !content.services.length && !content.projects.length ? "선택 영역" : <Check size={17} />}</span><Pencil size={16} className="section-pencil" /></button>;
      })}</nav>
      {feedback}{notice && <p className="assembly-feedback" role="status"><Check size={16} />{notice}</p>}
      <div className="assembly-toolbar"><span>{preview ? "방문자에게 보이는 화면" : "홈페이지에서 바꿀 부분을 눌러보세요"}</span><div className="assembly-tools"><div className="device-switch" role="group" aria-label="화면 크기"><button aria-label="데스크톱 화면" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}><Monitor size={18} /></button><button aria-label="모바일 화면" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}><Smartphone size={18} /></button></div><Button size="sm" variant={preview ? "default" : "outline"} aria-pressed={preview} onClick={() => setPreview(!preview)}>{preview ? <Pencil size={16} /> : <Eye size={16} />}{preview ? "편집으로 돌아가기" : "미리보기"}</Button></div></div>
      <div ref={canvas} className={`assembly-canvas ${device} ${preview ? "viewing" : "editing"}`} aria-busy={busy}><div className="assembly-browser"><span aria-hidden="true"><i /><i /><i /></span><span>{content.name || "나"}의 홈페이지</span><span>{preview ? "미리보기" : "편집 중"}</span></div><BusinessTemplate content={section ? draft : content} ownerId={site.ownerId} preview onEditSection={preview ? undefined : openSection} editingDisabled={busy} /></div>
      <p className="assembly-footnote">영역에 적용한 뒤 임시저장으로 보관하세요. 공개하기를 눌러야 방문자에게 보여요.</p>
    </main>
    <Dialog open={section !== null} onOpenChange={open => { if (!open) closeSection(); }}><DialogContent className="section-dialog" onPointerDownOutside={e => e.preventDefault()} onEscapeKeyDown={e => { if (uploads) e.preventDefault(); }} onCloseAutoFocus={e => { e.preventDefault(); if (returnFocus.current?.isConnected) returnFocus.current.focus(); else canvas.current?.querySelector<HTMLButtonElement>(".region-edit-button")?.focus(); }}>
      {section && <><div className="section-dialog-heading"><span className="section-dialog-label">{SECTION_INFO[section].label} 편집</span><DialogTitle>{SECTION_INFO[section].title}</DialogTitle><DialogDescription>{SECTION_INFO[section].description}</DialogDescription></div>
        <div className="section-dialog-tabs" role="tablist" aria-label="영역 편집 방법">{(["content", "template"] as const).map(value => <button key={value} id={`section-${value}-tab`} role="tab" aria-selected={tab === value} aria-controls={`section-${value}-panel`} tabIndex={tab === value ? 0 : -1} onKeyDown={e => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) { e.preventDefault(); const next = e.key === "Home" ? "content" : e.key === "End" ? "template" : value === "content" ? "template" : "content"; setTab(next); document.getElementById(`section-${next}-tab`)?.focus(); } }} onClick={() => setTab(value)}>{value === "content" ? <><Pencil size={16} />내용 채우기</> : <><Layers3 size={16} />템플릿 고르기<span>4</span></>}</button>)}</div>
        <div ref={dialogBody} className="section-dialog-body"><div id="section-content-panel" role="tabpanel" aria-labelledby="section-content-tab" hidden={tab !== "content"}><div className="current-template"><span>현재 모양 <strong>{SECTION_TEMPLATES[section].find(t => t.id === draft.layout[section])?.name}</strong></span><button onClick={() => setTab("template")}>템플릿 바꾸기</button></div><SectionFields key={section} focusPath={focusPath} section={section} content={draft} setContent={setDraft} ownerId={site.ownerId} issues={modalIssues} clearIssue={key => setModalIssues(old => old.filter(i => !i.path.startsWith(key)))} uploads={uploads} onBusy={onBusy} /></div>
          <div id="section-template-panel" role="tabpanel" aria-labelledby="section-template-tab" hidden={tab !== "template"}><SectionTemplatePicker section={section} layout={draft.layout} onChange={layout => setDraft(c => ({ ...c, layout }))} /></div>
          {modalIssues.length > 0 && <div className="editor-errors" role="alert"><h2>입력 내용을 확인해주세요.</h2><ul>{modalIssues.map(issue => <li key={issue.path}><button onClick={() => { setTab("content"); setFocusPath(issue.path); }}>{issue.message}</button></li>)}</ul></div>}
        </div><footer className="section-dialog-footer"><p>{uploads ? "사진 등록이 끝나면 적용할 수 있어요." : "적용 후에도 언제든 다시 수정할 수 있어요."}</p><div><Button variant="outline" onClick={closeSection} disabled={uploads > 0}>취소</Button><Button onClick={applySection} disabled={uploads > 0}><Check size={17} />{SECTION_INFO[section].label} 적용하기</Button></div></footer></>}
    </DialogContent></Dialog>
    <Dialog open={colorOpen} onOpenChange={setColorOpen}><DialogContent onCloseAutoFocus={e => { e.preventDefault(); returnFocus.current?.focus(); }}><DialogTitle>나의 색상</DialogTitle><DialogDescription>세 영역의 버튼과 강조 색상이 함께 바뀌어요.</DialogDescription><div className="color-options">{Object.entries(COLORS).map(([key, color]) => <button key={key} aria-pressed={content.color === key} onClick={() => { setContent(c => ({ ...c, color: key as SiteContent["color"] })); setNotice(""); }}><span style={{ backgroundColor: color.value }}>{content.color === key && <Check size={20} />}</span>{color.name}</button>)}</div><Button className="full-width color-done" onClick={() => setColorOpen(false)}>완료</Button></DialogContent></Dialog>
    <Dialog open={publishOpen} onOpenChange={open => { if (!busy) setPublishOpen(open); }}><DialogContent className="publish-dialog" onCloseAutoFocus={e => { e.preventDefault(); if (!section) returnFocus.current?.focus(); }} onEscapeKeyDown={e => { if (busy) e.preventDefault(); }}>
      <DialogTitle>세상에 소개할 준비가 됐나요?</DialogTitle><DialogDescription>홈페이지 주소를 정하고 완성한 내용을 공개해요.</DialogDescription><fieldset disabled={busy} className="editor-fieldset">
        <div className="field"><label htmlFor={fieldId("slug")}>홈페이지 주소<span className="required">필수</span></label><div className="slug-input"><span>{new URL(SITE_ORIGIN).host}/</span><input id={fieldId("slug")} value={slug} maxLength={30} disabled={!!site.slug} onChange={e => { setSlug(e.target.value); setSlugResult(null); setIssues(old => old.filter(i => i.path !== "slug")); }} placeholder="my-page" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-describedby="slug-help" /></div><p className="field-hint" id="slug-help">영문 소문자·숫자·하이픈 3~30자. 처음과 끝은 영문 또는 숫자.</p>{site.slug ? <p className="notice compact">처음 공개한 주소는 변경할 수 없어요.</p> : <Button variant="outline" size="sm" onClick={() => void checkSlug()} disabled={checking || !slug}>{checking ? "확인 중…" : "주소 사용 가능 여부 확인"}</Button>}{slugResult?.value === slug && <p className={slugResult.available ? "field-success" : "field-error"} role="status">{slugResult.message}</p>}</div>
        <div className="publish-checklist"><h2>{pending.length ? "조금만 더 채워주세요" : "공개할 준비가 되었어요"}</h2>{REGIONS.map(region => { const required = pending.filter(i => sectionForField(i.path) === region); return <button key={region} onClick={() => openSection(region, required[0]?.path)}><span className={required.length ? "check-pending" : "check-complete"}>{required.length ? <Pencil size={14} /> : <Check size={15} />}</span>{SECTION_INFO[region].label} · {SECTION_INFO[region].title}<span>{required.length ? `${required.length}개 확인` : "준비 완료"}</span></button>; })}</div>
        <p className="notice">공개하면 누구나 이 주소로 방문할 수 있어요. 임시저장한 변경사항도 함께 공개돼요.</p>{feedback}<Button className="full-width" onClick={() => void save(true)} disabled={busy || uploads > 0}>{busy ? "공개 중…" : site.status === "published" ? "공개 내용 업데이트" : site.status === "private" ? "현재 초안으로 다시 공개" : "홈페이지 공개"}</Button>
      </fieldset></DialogContent></Dialog>
    <Dialog open={success} onOpenChange={setSuccess}><DialogContent><div className="publish-success-icon"><CheckCircle2 size={32} /></div><DialogTitle>홈페이지가 공개되었습니다.</DialogTitle><DialogDescription>나만의 공간이 열렸어요. 아래 주소로 새로운 사람들과 만나보세요.</DialogDescription><p className="success-url selectable">{SITE_ORIGIN}/{site.slug}</p><div className="dialog-actions"><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(`${SITE_ORIGIN}/${site.slug}`); setNotice("주소를 복사했어요."); } catch { setNotice("표시된 주소를 직접 선택해 복사해주세요."); } }}><Copy size={16} />주소 복사</Button><Button asChild><a href={`/${site.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />홈페이지 열기</a></Button></div><Button variant="ghost" className="full-width" onClick={() => setSuccess(false)}>계속 수정하기</Button><p role="status" className="field-hint">{notice}</p></DialogContent></Dialog>
  </div>;
}
