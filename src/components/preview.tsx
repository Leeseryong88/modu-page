"use client";
import Link from "next/link";
import { useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { useSite } from "@/hooks/use-site";
import { BusinessTemplate } from "./business-template";
import { Button } from "./ui/button";
export function Preview() {
  const { site, loading, error, reload } = useSite(); const [device, setDevice] = useState("desktop");
  return <main id="main" className="standalone-preview"><header><div><strong>저장한 초안 미리보기</strong><span>공개된 내용과 다를 수 있어요.</span></div><div><Button variant={device === "desktop" ? "default" : "outline"} size="icon" aria-label="데스크톱 미리보기" onClick={() => setDevice("desktop")}><Monitor size={18} /></Button><Button variant={device === "mobile" ? "default" : "outline"} size="icon" aria-label="모바일 미리보기" onClick={() => setDevice("mobile")}><Smartphone size={18} /></Button><Button asChild variant="outline" size="sm"><Link href="/dashboard/editor">계속 수정하기</Link></Button></div></header>{loading ? <div className="state-panel" role="status">미리보기를 불러오고 있어요…</div> : error ? <div className="state-panel" role="alert"><p>{error}</p><Button onClick={() => void reload()}>다시 시도</Button></div> : site && <div className={`preview-stage ${device} large`}><div className="preview-page"><BusinessTemplate content={site.draft} ownerId={site.ownerId} preview /></div></div>}</main>;
}
