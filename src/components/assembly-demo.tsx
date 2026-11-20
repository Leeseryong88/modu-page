"use client";
import { useRef, useState } from "react";
import { Check, Globe2, MousePointer2, Pencil } from "lucide-react";
import { DEFAULT_LAYOUT, SECTION_INFO, type SiteSection } from "@/lib/section-layouts";
import type { SiteContent } from "@/lib/schema";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { SectionTemplatePicker } from "./section-template-picker";
import { Button } from "./ui/button";
import "./editor.css";
import "./assembly-demo.css";

type DemoContent = { name: string; tagline: string; about: string; contact: string; layout: SiteContent["layout"] };
const initial: DemoContent = { name: "김하늘의 기록", tagline: "작은 발견을 모아, 나다운 이야기를 만듭니다.", about: "좋아하는 것을 관찰하고 기록하는 사람입니다. 사진과 디자인으로 나의 시선을 나눕니다.", contact: "함께하고 싶은 일이 있다면 편하게 이야기해주세요.", layout: { ...DEFAULT_LAYOUT, top: "editorial" } };
export function AssemblyDemo() {
  const [content, setContent] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [section, setSection] = useState<SiteSection | null>(null);
  const [tab, setTab] = useState<"content" | "template">("content");
  const [notice, setNotice] = useState("");
  const focus = useRef<HTMLElement | null>(null);
  function open(value: SiteSection) { focus.current = document.activeElement as HTMLElement; setDraft(structuredClone(content)); setSection(value); setTab("content"); }
  return <div className="assembly-demo">
    <div className="assembly-demo-intro"><span className="assembly-demo-badge"><MousePointer2 size={16} />지금 바로 눌러보세요</span><h3>빈 화면에서 고민하지 말고,<br />세 부분만 채워보세요.</h3><p>마음에 드는 모양을 고르고,<br />내 이야기를 넣으면 끝.<br />각 부분은 언제든 다시 바꿀 수 있어요.</p><ol>{(["top", "middle", "bottom"] as const).map((part, i) => <li key={part}><span>0{i+1}</span><div><strong>{SECTION_INFO[part].label} · {SECTION_INFO[part].title}</strong><p>{SECTION_INFO[part].contents}</p></div></li>)}</ol><small>저장되지 않는 간단한 체험입니다.<br />실제 편집기에서는 사진 등록과 더 자세한 작성이 가능해요.</small></div>
    <div className="assembly-demo-canvas"><div className="assembly-demo-bar"><Globe2 size={14} /><span>내 홈페이지 · 조립 체험</span><span>눌러서 편집</span></div>
      <button className={`assembly-demo-region demo-top demo-${content.layout.top}`} onClick={() => open("top")} aria-label="상단 첫인상 편집 체험"><span className="assembly-demo-edit">상단 <Pencil size={12} /></span><div><small>MY OWN PAGE</small><h4>{content.name || "나의 페이지"}</h4><p>{content.tagline}</p></div><img src="/images/use-cases/creative-work.webp" alt="종이와 색, 조형물로 구성한 창작 작업" width={600} height={400} loading="lazy" /></button>
      <button className={`assembly-demo-region demo-middle demo-${content.layout.middle}`} onClick={() => open("middle")} aria-label="중단 이야기 편집 체험"><span className="assembly-demo-edit">중단 <Pencil size={12} /></span><h4>나의 이야기</h4><p>{content.about}</p><div className="demo-pieces">{["관찰하는 시선", "작은 실험", "나누는 기록"].map((label, i) => <span key={label}><i>0{i+1}</i>{label}</span>)}</div></button>
      <button className={`assembly-demo-region demo-bottom demo-${content.layout.bottom}`} onClick={() => open("bottom")} aria-label="하단 연락 안내 편집 체험"><span className="assembly-demo-edit">하단 <Pencil size={12} /></span><div><h4>우리, 연결될까요?</h4><p>{content.contact}</p></div><span className="demo-contact-chip">문의 남기기 ↗</span></button>
      <p className="assembly-demo-status" role="status">{notice || "상단·중단·하단 중 바꾸고 싶은 부분을 눌러보세요."}</p>
    </div>
    <Dialog open={section !== null} onOpenChange={value => { if (!value) setSection(null); }}><DialogContent className="assembly-demo-dialog" onCloseAutoFocus={event => { event.preventDefault(); focus.current?.focus(); }}>{section && <><DialogTitle>{SECTION_INFO[section].label} · {SECTION_INFO[section].title}</DialogTitle><DialogDescription>내용과 모양을 고른 뒤 적용해보세요. 이 체험은 저장되지 않아요.</DialogDescription><div className="demo-dialog-tabs" role="group" aria-label="체험 편집 방식"><button aria-pressed={tab === "content"} onClick={() => setTab("content")}>내용 채우기</button><button aria-pressed={tab === "template"} onClick={() => setTab("template")}>템플릿 고르기</button></div>
      <div className="demo-dialog-body">{tab === "template" ? <SectionTemplatePicker section={section} layout={draft.layout} onChange={layout => setDraft(v => ({ ...v, layout }))} /> : <>{(section === "top" ? ["name", "tagline"] : section === "middle" ? ["about"] : ["contact"]).map(key => { const field = key as Exclude<keyof DemoContent, "layout">; return <label className="demo-field" key={field}><span>{{ name: "이름 또는 페이지 이름", tagline: "한 줄 소개", about: "나의 이야기", contact: "연락 안내" }[field]}</span>{field === "about" || field === "contact" ? <textarea rows={4} value={draft[field]} maxLength={200} onChange={e => setDraft(v => ({ ...v, [field]: e.target.value }))} /> : <input value={draft[field]} maxLength={field === "name" ? 30 : 80} onChange={e => setDraft(v => ({ ...v, [field]: e.target.value }))} />}</label>; })}<p className="demo-field-help">모양도 바꿔보고 싶다면 ‘템플릿 고르기’를 눌러보세요.</p></>}</div>
      <div className="demo-dialog-actions"><Button variant="outline" onClick={() => setSection(null)}>취소</Button><Button onClick={() => { setContent(draft); setNotice(`${SECTION_INFO[section].label}을 바꿨어요. 다른 부분도 눌러보세요.`); setSection(null); }}><Check size={16} />이 부분 적용하기</Button></div></>}</DialogContent></Dialog>
  </div>;
}
