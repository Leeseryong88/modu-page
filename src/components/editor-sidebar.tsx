"use client";
import { useRef, useState } from "react";
import { ImagePlus, Layers3, Pencil, Upload, X } from "lucide-react";
import { SECTION_INFO, type SiteSection } from "@/lib/section-layouts";
import { IMAGE_DRAG_TYPE } from "@/lib/image-layout";
import { mediaUrl } from "@/lib/media";
import { uploadLibraryImage } from "@/lib/upload-image";
import type { SiteContent, SiteImage } from "@/lib/schema";
import { SectionTemplatePicker } from "./section-template-picker";
import { Button } from "./ui/button";

export type SidebarTab = "templates" | "images" | "text";
export function EditorSidebar({ content, ownerId, tab, setTab, open, setOpen, disabled, images, selectedImage, onSelect, onUpload, onLayout, onEdit, onBusy, loading, libraryError, hasMore, loadMore }: {
  content: SiteContent; ownerId: string; tab: SidebarTab; setTab: (tab: SidebarTab) => void;
  open: boolean; setOpen: (open: boolean) => void; disabled: boolean;
  images: SiteImage[]; selectedImage: SiteImage | null; onSelect: (image: SiteImage) => void; onUpload: (image: SiteImage) => void;
  onLayout: (layout: SiteContent["layout"]) => void; onEdit: (section: SiteSection) => void;
  onBusy: (delta: number) => void; loading: boolean; libraryError: string; hasMore: boolean; loadMore: () => void;
}) {
  const [region, setRegion] = useState<SiteSection>("top");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadLock = useRef(false);
  async function upload(files: File[]) {
    if (disabled || uploadLock.current || !files.length) return;
    uploadLock.current = true; setUploading(true); onBusy(1); setErrors([]);
    const failures: string[] = [];
    try {
      for (const [index, file] of files.slice(0, 10).entries()) {
        setUploadMessage(`${index + 1}/${Math.min(files.length, 10)} · ${file.name} 준비 중`);
        try { const image = await uploadLibraryImage(file, percent => setUploadMessage(`${index + 1}/${Math.min(files.length, 10)} · ${percent}%`)); onUpload(image); }
        catch (error) { failures.push(`${file.name}: ${(error as Error).message}`); }
      }
      if (files.length > 10) failures.push("한 번에 10장까지 등록할 수 있어요. 나머지 사진은 다시 선택해주세요.");
      setErrors(failures); setUploadMessage(failures.length ? "등록하지 못한 사진을 확인하고 다시 선택해주세요." : "사진을 보관함에 등록했어요. 사진을 골라 홈페이지에 넣어보세요.");
    } finally { uploadLock.current = false; setUploading(false); onBusy(-1); if (fileInput.current) fileInput.current.value = ""; }
  }
  return <aside className={`editor-sidebar ${open ? "sidebar-open" : ""}`} aria-label="홈페이지 편집 도구">
    <nav className="sidebar-tabs" aria-label="편집 도구 선택">{([
      ["templates", "템플릿", Layers3], ["images", "내 이미지", ImagePlus], ["text", "내용", Pencil],
    ] as const).map(([value, label, Icon]) => <button type="button" key={value} aria-pressed={tab === value && open} onClick={() => { setTab(value); setOpen(tab !== value || !open); }}><Icon size={18} />{label}</button>)}</nav>
    <div className="sidebar-body">
      <div className="sidebar-heading"><div><span>나만의 홈페이지 만들기</span><h2>{tab === "templates" ? "어떤 모습으로 만들까요?" : tab === "images" ? "내 사진으로 채워보세요" : "내 이야기를 담아보세요"}</h2></div><button className="sidebar-close" onClick={() => setOpen(false)} aria-label="편집 도구 접기"><X size={20} /></button></div>
      {tab === "templates" && <fieldset disabled={disabled} className="sidebar-fieldset"><p className="sidebar-help">영역을 고르고 마음에 드는 모양을 누르세요. 내용과 사진은 그대로 유지돼요.</p><div className="sidebar-regions" role="group" aria-label="템플릿 영역">{(["top", "middle", "bottom"] as const).map(key => <button type="button" key={key} aria-pressed={region === key} onClick={() => setRegion(key)}>{SECTION_INFO[key].label}</button>)}</div><SectionTemplatePicker section={region} layout={content.layout} onChange={onLayout} /></fieldset>}
      {tab === "images" && <>
        <p className="sidebar-help">사진을 끌어 홈페이지의 사진 영역에 놓으세요. 휴대폰에서는 사진 선택 후 넣을 영역을 누르면 돼요.</p>
        <div className="library-upload" onDragOver={event => { if (!disabled && !uploading && event.dataTransfer.types.includes("Files")) event.preventDefault(); }} onDrop={event => { if (event.dataTransfer.files.length) { event.preventDefault(); void upload(Array.from(event.dataTransfer.files)); } }}>
          <Upload size={23} /><strong>사진을 올려 보관하세요</strong><span>JPG · PNG · WebP / 장당 5MB</span><Button variant="outline" disabled={disabled || uploading} onClick={() => fileInput.current?.click()}>사진 업로드</Button><input ref={fileInput} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple aria-label="보관함에 사진 업로드" disabled={disabled || uploading} onChange={event => void upload(Array.from(event.target.files ?? []))} />
        </div>
        {uploadMessage && <p className="sidebar-help" role="status">{uploadMessage}</p>}
        {!!errors.length && <ul className="library-errors" role="alert">{errors.map(message => <li key={message}>{message}</li>)}</ul>}
        <div className="library-count"><strong>내 이미지 <span>{images.length}</span></strong><span>선택하거나 끌어놓기</span></div>
        <div className="library-grid">{images.map((image, index) => <button type="button" key={image.id} disabled={disabled} draggable={!disabled} aria-pressed={selectedImage?.id === image.id} aria-label={`보관함 사진 ${index + 1} 선택`} onClick={() => { onSelect(image); setOpen(false); }} onDragStart={event => { event.dataTransfer.setData(IMAGE_DRAG_TYPE, image.id); event.dataTransfer.effectAllowed = "copy"; }}><img src={mediaUrl(ownerId, image)} width={image.width} height={image.height} alt={`내 사진 ${index + 1}`} draggable={false} loading="lazy" /><span>{image.width} × {image.height}</span></button>)}</div>
        {!images.length && !loading && <p className="sidebar-help">아직 사진이 없어요. 사진을 올리면 여기에 모아둘 수 있어요.</p>}
        {libraryError && <p className="field-error" role="alert">{libraryError}</p>}
        {(hasMore || libraryError) && <Button variant="outline" className="full-width" disabled={loading} onClick={loadMore}>{loading ? "불러오는 중…" : libraryError ? "다시 불러오기" : "사진 더 보기"}</Button>}
        {loading && <p role="status" className="sidebar-help">사진을 불러오고 있어요…</p>}
      </>}
      {tab === "text" && <><p className="sidebar-help">이름, 소개 글, 작업 설명과 연락처를 수정해요. 홈페이지에서도 영역의 ‘내용 편집’을 누를 수 있어요.</p><div className="sidebar-content-buttons">{(["top", "middle", "bottom"] as const).map(key => <button disabled={disabled} key={key} onClick={() => onEdit(key)}><strong>{SECTION_INFO[key].label} 내용 편집</strong><span>{SECTION_INFO[key].contents}</span><Pencil size={17} /></button>)}</div></>}
    </div>
  </aside>;
}
