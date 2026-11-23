"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, CheckCircle2, Copy, ExternalLink, Eye, Layers3, Monitor, Palette, Pencil, Save, Smartphone } from "lucide-react";
import { COLORS, SITE_ORIGIN } from "@/lib/brand";
import { api, ApiError } from "@/lib/api-client";
import { contentSchema, fieldStep, publishIssues, slugError, type SiteContent, type SiteRecord, type ValidationIssue, type SiteImage } from "@/lib/schema";
import { DEFAULT_LAYOUT, SECTION_INFO, sectionForField, type SiteSection } from "@/lib/section-layouts";
import { formatDate } from "@/lib/utils";
import { useSite } from "@/hooks/use-site";
import { BrandLogo } from "./site-header";
import { BusinessTemplate } from "./business-template";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { SiteStarter } from "./site-starter";
import "./editor.css";
import "./editor-sidebar.css";
import { EditorSidebar, type SidebarTab } from "./editor-sidebar";
import { ImageCropDialog } from "./image-crop-dialog";
import { defaultCrop, placeImage, type ImageTarget } from "@/lib/image-layout";
import { mediaUrl } from "@/lib/media";
import { SiteQr } from "./site-qr";

const REGIONS: SiteSection[] = ["top", "middle", "bottom"];
const REGION_FIELD: Record<SiteSection, string> = { top: "name", middle: "about", bottom: "phone" };
function fieldId(path: string) { return `field-${path.replaceAll(".", "-")}`; }
function withLayout(content: SiteContent): SiteContent { return { ...content, layout: { ...DEFAULT_LAYOUT, ...content.layout } }; }
function inputIssues(content: SiteContent) {
  const result = contentSchema.safeParse(content);
  return result.success ? [] : result.error.issues.map(i => ({ path: i.path.join("."), message: i.message, step: fieldStep(i.path.join(".")) }));
}
export function Editor({ exampleSlug }: { exampleSlug?: string }) {
  const { site, loading, error, reload } = useSite();
  const [started, setStarted] = useState<SiteRecord | null>(null);
  const [exampleName, setExampleName] = useState("");
  const [continueDraft, setContinueDraft] = useState(false);
  if (loading) return <div className="state-panel" role="status" aria-busy="true">저장한 내용을 불러오고 있어요…</div>;
  if (error || !site) return <div className="state-panel" role="alert"><p>{error}</p><Button onClick={() => void reload()}>다시 시도</Button></div>;
  if (!started && !continueDraft && (site.revision === 0 || exampleSlug !== undefined)) return <SiteStarter site={site} exampleSlug={exampleSlug} onStarted={(next, name) => { setExampleName(name ?? ""); setStarted(next); }} onContinue={() => { window.history.replaceState(null, "", "/dashboard/editor"); setContinueDraft(true); }} />;
  return <EditorWorkspace initial={started ?? site} exampleName={exampleName} />;
}
function EditorWorkspace({ initial, exampleName }: { initial: SiteRecord; exampleName: string }) {
  const [site, setSite] = useState(initial);
  const [content, setContent] = useState(() => withLayout(initial.draft));
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
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [success, setSuccess] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>("templates");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [library, setLibrary] = useState<SiteImage[]>(() => [initial.draft.hero, initial.draft.logo, ...initial.draft.projects.map(p => p.image)].filter((image): image is SiteImage => !!image));
  const [libraryCursor, setLibraryCursor] = useState<string | null>(null);
  const [libraryLoading, setLibraryLoading] = useState(false);
  const [libraryError, setLibraryError] = useState("");
  const [selectedImage, setSelectedImage] = useState<SiteImage | null>(null);
  const [cropTarget, setCropTarget] = useState<{ target: ImageTarget; image: SiteImage; ratio: number } | null>(null);
  const libraryLock = useRef(false);
  const loadLibrary = useCallback(async (cursor?: string | null) => {
    if (libraryLock.current) return;
    libraryLock.current = true; setLibraryLoading(true); setLibraryError("");
    try {
      const page = await api<{ images: SiteImage[]; cursor: string | null }>("/api/media" + (cursor ? "?cursor=" + encodeURIComponent(cursor) : ""));
      setLibrary(old => [...new Map([...old, ...page.images].map(image => [image.id, image])).values()]); setLibraryCursor(page.cursor);
    } catch (error) { setLibraryError((error as Error).message); }
    finally { libraryLock.current = false; setLibraryLoading(false); }
  }, []);
  useEffect(() => { void loadLibrary(); }, [loadLibrary]);
  const images = [...new Map([...library, content.hero, content.logo, ...content.projects.map(p => p.image)].filter((image): image is SiteImage => !!image).map(({ id, width, height }) => [id, { id, width, height }])).values()];
  function chooseImages() { setSidebarTab("images"); setSidebarOpen(true); }
  function putImage(target: ImageTarget, image: SiteImage) {
    if (busy || preview) return;
    setContent(c => placeImage(c, target, { ...image, crop: defaultCrop("center", target === "logo" ? "contain" : "cover") }));
    setSelectedImage(null); setError(""); setNotice(target === "new-project" ? "사진을 추가했어요. 제목·설명을 입력하고 구도를 조절해보세요." : "사진을 넣었어요. ‘구도 조절’을 눌러 위치와 크기를 맞춰보세요.");
  }
  const returnFocus = useRef<HTMLElement | null>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const dirty = JSON.stringify(content) !== JSON.stringify(withLayout(site.draft)) || slug !== (site.slug || site.draftSlug || "");
  const locked = busy || uploads > 0 || cropTarget !== null;
  const onBusy = useCallback((delta: number) => setUploads(n => n + delta), []);
  useEffect(() => {
    if (!dirty && !uploads && !cropTarget) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); };
    const leave = (event: MouseEvent) => {
      const link = (event.target as Element).closest("a");
      if (!link || link.target === "_blank" || !link.getAttribute("href") || link.getAttribute("href")!.startsWith("#")) return;
      if (!window.confirm("저장하지 않은 변경사항이 있어요. 저장하지 않고 나갈까요?")) { event.preventDefault(); event.stopPropagation(); }
    };
    window.addEventListener("beforeunload", unload); document.addEventListener("click", leave, true);
    return () => { window.removeEventListener("beforeunload", unload); document.removeEventListener("click", leave, true); };
  }, [dirty, uploads, cropTarget]);
  function rememberFocus() { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }
  function focusField(path: string) {
    if (path === "slug") { setPublishOpen(true); setTimeout(() => document.getElementById(fieldId("slug"))?.focus(), 100); return; }
    setPreview(false); setPublishOpen(false); setSidebarOpen(false);
    window.setTimeout(() => {
      const field = canvas.current?.querySelector<HTMLElement>(`[data-edit-path="${CSS.escape(path)}"]`);
      const target = field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement || field instanceof HTMLButtonElement ? field : field?.querySelector<HTMLElement>("button, input, textarea, select") ?? field;
      target?.focus(); target?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 100);
  }
  async function save(publishing = false) {
    if (uploads || busy) return;
    const found = inputIssues(content);
    if (publishing) { found.push(...publishIssues(content)); const message = slugError(slug); if (message) found.push({ path: "slug", message, step: 4 }); }
    setIssues(found); setError(""); setNotice("");
    if (found.length) { setError("입력한 내용을 확인해주세요."); if (publishing) setPublishOpen(true); else focusField(found[0].path); return; }
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
  const feedback = error && <div className="editor-errors" role="alert"><h2>{error}</h2>{issues.length > 0 && <ul>{issues.map((issue, i) => <li key={`${issue.path}-${i}`}><button onClick={() => focusField(issue.path)}>{issue.message}</button></li>)}</ul>}</div>;
  return <div className="assembly-editor">
    <header className="assembly-header"><BrandLogo /><span className="assembly-heading">홈페이지 편집</span><div className="assembly-header-actions">
      <div className="assembly-save-status" role="status"><strong>{busy ? "저장 중…" : uploads ? "사진 등록 중…" : dirty ? "저장할 변경사항이 있어요" : site.savedAt ? "저장 완료" : "첫 홈페이지를 만들어보세요"}</strong>{site.savedAt && <span>마지막 저장 {formatDate(site.savedAt)}</span>}</div>
      <Button variant="outline" size="sm" onClick={() => void save()} disabled={busy || uploads > 0}><Save size={16} />임시저장</Button><Button size="sm" onClick={() => { rememberFocus(); setPublishOpen(true); }} disabled={busy}>공개하기</Button><Link href="/dashboard" className="assembly-exit">관리 화면</Link>
    </div></header>
    <main id="main" className={`assembly-main sidebar-workspace ${preview ? "workspace-preview" : ""}`}>
      {!preview && <EditorSidebar content={content} ownerId={site.ownerId} tab={sidebarTab} setTab={setSidebarTab} open={sidebarOpen} setOpen={setSidebarOpen} disabled={locked} images={images} selectedImage={selectedImage} onSelect={setSelectedImage} onUpload={image => setLibrary(old => [image, ...old])} onLayout={layout => { setContent(c => ({ ...c, layout })); setNotice("템플릿을 바꿨어요. 내용과 사진은 유지돼요."); }} onJump={focusField} onBusy={onBusy} loading={libraryLoading} libraryError={libraryError} hasMore={!!libraryCursor} loadMore={() => void loadLibrary(libraryCursor)} />}
      <div className="editor-workspace-page">
      {exampleName && <div className="starter-imported" role="status"><CheckCircle2 size={22} /><div><strong>‘{exampleName}’ 예시를 내 초안으로 가져왔어요.</strong><p>사진과 디자인은 준비됐어요. 상단에서 이름과 소개, 중단에서 사진과 활동, 하단에서 연락 방법을 내 정보로 바꿔주세요.</p><button onClick={() => focusField("name")}>내 이름부터 바꾸기</button></div></div>}
      <div className="assembly-intro"><div><span className="assembly-eyebrow"><Layers3 size={16} />세 부분으로 완성하는 우리 홈페이지</span><h1>고르고, 놓고, 나답게.</h1><p>템플릿을 고르고 사진을 넣은 뒤, 화면의 글을 바로 고쳐보세요.</p></div><Button variant="outline" onClick={() => { rememberFocus(); setColorOpen(true); }} disabled={busy}><Palette size={17} />전체 색상</Button></div>
      {feedback}{notice && <p className="assembly-feedback" role="status"><Check size={16} />{notice}</p>}
      <div className="assembly-toolbar"><span>{preview ? "방문자에게 보이는 화면" : "글은 화면에서 바로 고치세요"}</span><div className="assembly-tools"><div className="device-switch" role="group" aria-label="화면 크기"><button aria-label="데스크톱 화면" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}><Monitor size={18} /></button><button aria-label="모바일 화면" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}><Smartphone size={18} /></button></div><Button size="sm" variant={preview ? "default" : "outline"} aria-pressed={preview} disabled={busy || uploads > 0} onClick={() => setPreview(!preview)}>{preview ? <Pencil size={16} /> : <Eye size={16} />}{preview ? "편집으로 돌아가기" : "미리보기"}</Button></div></div>
      {selectedImage && !preview && <div className="image-placement-notice" role="status"><img src={mediaUrl(site.ownerId, selectedImage)} alt="선택한 사진" /><span>사진을 넣을 영역을 누르세요.</span><button onClick={() => setSelectedImage(null)}>선택 취소</button></div>}
      <div ref={canvas} className={`assembly-canvas ${device} ${preview ? "viewing" : "editing"}`} aria-busy={busy}><div className="assembly-browser"><span aria-hidden="true"><i /><i /><i /></span><span>{content.name || "나"}의 홈페이지</span><span>{preview ? "미리보기" : "편집 중"}</span></div><BusinessTemplate content={content} ownerId={site.ownerId} preview photoEditing={preview ? undefined : { selectedImage, disabled: locked, resolveImage: id => images.find(image => image.id === id), onPlace: putImage, onChoose: chooseImages, onAdjust: (target, image, ratio) => { rememberFocus(); setCropTarget({ target, image, ratio }); } }} textEditing={preview ? undefined : { disabled: locked, issues, onChange: (path, update) => { setContent(update); setIssues(old => old.filter(issue => issue.path !== path && !issue.path.startsWith(`${path}.`))); setNotice(""); } }} /></div>
      <p className="assembly-footnote">글과 사진 배치는 임시저장으로 보관하세요. 공개하기 전까지 기존 홈페이지는 그대로예요.</p>
      </div>
    </main>
    {cropTarget && <ImageCropDialog restoreFocus={() => returnFocus.current?.focus()} image={cropTarget.image} src={mediaUrl(site.ownerId, cropTarget.image)} ratio={cropTarget.ratio} position={cropTarget.target === "hero" ? content.heroPosition : "center"} logo={cropTarget.target === "logo"} onClose={() => setCropTarget(null)} onApply={crop => { setContent(c => placeImage(c, cropTarget.target, { ...cropTarget.image, crop })); setCropTarget(null); setNotice("사진 구도를 적용했어요. 임시저장을 눌러 보관해주세요."); }} />}
    <Dialog open={colorOpen} onOpenChange={setColorOpen}><DialogContent onCloseAutoFocus={e => { e.preventDefault(); returnFocus.current?.focus(); }}><DialogTitle>나의 색상</DialogTitle><DialogDescription>세 영역의 버튼과 강조 색상이 함께 바뀌어요.</DialogDescription><div className="color-options">{Object.entries(COLORS).map(([key, color]) => <button key={key} aria-pressed={content.color === key} onClick={() => { setContent(c => ({ ...c, color: key as SiteContent["color"] })); setNotice(""); }}><span style={{ backgroundColor: color.value }}>{content.color === key && <Check size={20} />}</span>{color.name}</button>)}</div><Button className="full-width color-done" onClick={() => setColorOpen(false)}>완료</Button></DialogContent></Dialog>
    <Dialog open={publishOpen} onOpenChange={open => { if (!busy) setPublishOpen(open); }}><DialogContent className="publish-dialog" onCloseAutoFocus={e => { e.preventDefault(); returnFocus.current?.focus(); }} onEscapeKeyDown={e => { if (busy) e.preventDefault(); }}>
      <DialogTitle>세상에 소개할 준비가 됐나요?</DialogTitle><DialogDescription>홈페이지 주소를 정하고 완성한 내용을 공개해요.</DialogDescription><fieldset disabled={busy} className="editor-fieldset">
        <div className="field"><label htmlFor={fieldId("slug")}>홈페이지 주소<span className="required">필수</span></label><div className="slug-input"><span>{new URL(SITE_ORIGIN).host}/</span><input id={fieldId("slug")} value={slug} maxLength={30} disabled={!!site.slug} onChange={e => { setSlug(e.target.value); setSlugResult(null); setIssues(old => old.filter(i => i.path !== "slug")); }} placeholder="my-page" autoCapitalize="none" autoCorrect="off" spellCheck={false} aria-describedby="slug-help" /></div><p className="field-hint" id="slug-help">영문 소문자·숫자·하이픈 3~30자. 처음과 끝은 영문 또는 숫자.</p>{site.slug ? <p className="notice compact">처음 공개한 주소는 변경할 수 없어요.</p> : <Button variant="outline" size="sm" onClick={() => void checkSlug()} disabled={checking || !slug}>{checking ? "확인 중…" : "주소 사용 가능 여부 확인"}</Button>}{slugResult?.value === slug && <p className={slugResult.available ? "field-success" : "field-error"} role="status">{slugResult.message}</p>}</div>
        <div className="publish-checklist"><h2>{pending.length ? "조금만 더 채워주세요" : "공개할 준비가 되었어요"}</h2>{REGIONS.map(region => { const required = pending.filter(i => sectionForField(i.path) === region); return <button key={region} onClick={() => focusField(required[0]?.path ?? REGION_FIELD[region])}><span className={required.length ? "check-pending" : "check-complete"}>{required.length ? <Pencil size={14} /> : <Check size={15} />}</span>{SECTION_INFO[region].label} · {SECTION_INFO[region].title}<span>{required.length ? `${required.length}개 확인` : "준비 완료"}</span></button>; })}</div>
        <p className="notice">공개하면 누구나 이 주소로 방문할 수 있어요. 임시저장한 변경사항도 함께 공개돼요.</p>{feedback}<Button className="full-width" onClick={() => void save(true)} disabled={busy || uploads > 0}>{busy ? "공개 중…" : site.status === "published" ? "공개 내용 업데이트" : site.status === "private" ? "현재 초안으로 다시 공개" : "홈페이지 공개"}</Button>
      </fieldset></DialogContent></Dialog>
    <Dialog open={success} onOpenChange={setSuccess}><DialogContent><div className="publish-success-icon"><CheckCircle2 size={32} /></div><DialogTitle>홈페이지가 공개되었습니다.</DialogTitle><DialogDescription>나만의 공간이 열렸어요. 아래 주소나 QR로 새로운 사람들과 만나보세요.</DialogDescription><p className="success-url selectable">{SITE_ORIGIN}/{site.slug}</p>{site.slug && <SiteQr url={`${SITE_ORIGIN}/${site.slug}`} label={`${content.name || "홈페이지"}로 이동하는 QR 코드`} fileName={`${site.slug}-qr.png`} />}<div className="dialog-actions"><Button variant="outline" onClick={async () => { try { await navigator.clipboard.writeText(`${SITE_ORIGIN}/${site.slug}`); setNotice("주소를 복사했어요."); } catch { setNotice("표시된 주소를 직접 선택해 복사해주세요."); } }}><Copy size={16} />주소 복사</Button><Button asChild><a href={`/${site.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />홈페이지 열기</a></Button></div><Button variant="ghost" className="full-width" onClick={() => setSuccess(false)}>계속 수정하기</Button><p role="status" className="field-hint">{notice}</p></DialogContent></Dialog>
  </div>;
}
