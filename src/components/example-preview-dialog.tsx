"use client";
import Link from "next/link";
import { useRef, type MouseEvent, type RefObject, type ReactNode } from "react";
import { Maximize2 } from "lucide-react";
import type { BusinessExample } from "@/lib/examples";
import { exampleEditorHref } from "@/lib/start-path";
import { BusinessTemplate } from "./business-template";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import "./site-examples.css";

export function ExamplePreviewDialog({ example, onClose, opener, footer, busy = false }: { example: BusinessExample | null; onClose: () => void; opener: RefObject<HTMLElement | null>; footer?: ReactNode; busy?: boolean }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  function navigateWithinExample(event: MouseEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
    const id = link?.getAttribute("href")?.slice(1);
    const target = id ? document.getElementById(id) : null;
    const container = event.currentTarget;
    if (!target || !container.contains(target)) return;
    event.preventDefault();
    container.scrollTo({ top: container.scrollTop + target.getBoundingClientRect().top - container.getBoundingClientRect().top - 16, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <Dialog open={example !== null} onOpenChange={open => { if (!open && !busy) onClose(); }}><DialogContent className="site-example-dialog" aria-busy={busy} onOpenAutoFocus={event => { event.preventDefault(); titleRef.current?.focus({ preventScroll: true }); }} onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus({ preventScroll: true }); }}>
    <div className="site-example-dialog-heading"><span>{example?.category} · 홈페이지 예시</span><DialogTitle ref={titleRef} tabIndex={-1}>{example?.content.name}</DialogTitle><DialogDescription>사진과 메뉴를 눌러보세요. 닫으면 보던 예시와 위치로 돌아가요.</DialogDescription></div>
    <div className="site-example-dialog-body" onClick={navigateWithinExample}>{example && <BusinessTemplate key={example.slug} content={example.content} ownerId="example" exampleImages={example.imageSources} preview />}</div>
    <div className="site-example-dialog-footer">{footer ?? <><span><Maximize2 size={15} />사진·문구·디자인을 가져와 내 내용으로 바꿔요.</span><Link href={example ? exampleEditorHref(example.slug) : "/dashboard/editor"}>이 예시로 시작하기</Link></>}</div>
  </DialogContent></Dialog>;
}
