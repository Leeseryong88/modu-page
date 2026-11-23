"use client";
import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Maximize2, Share2 } from "lucide-react";
import type { BusinessExample } from "@/lib/examples";
import { getExampleStory } from "@/lib/example-stories";
import { exampleEditorHref } from "@/lib/start-path";
import { ExampleThumbnail } from "./example-thumbnail";

export function ExampleCard({ example, onPreview }: { example: BusinessExample; onPreview: (example: BusinessExample) => void }) {
  const { usage } = getExampleStory(example);
  return <article className="ex-card" aria-labelledby={`example-${example.slug}-title`} style={{ "--case-color": example.tone, "--sample-color": example.tone } as CSSProperties}>
    <div className="ex-card-stage"><button type="button" className="ex-preview-button" onClick={() => onPreview(example)} aria-label={`${example.content.name} 홈페이지 크게 둘러보기`}><ExampleThumbnail example={example} /><span className="ex-preview-hint"><Maximize2 size={15} />전체 홈페이지 보기</span></button></div>
    <div className="ex-card-copy"><div className="ex-card-title"><div><span>{example.category}</span><h3 id={`example-${example.slug}-title`}>{example.content.name}</h3></div><span className="ex-photo-count">사진 {example.content.projects.length + 1}장</span></div><p>{example.summary}</p><div className="ex-card-usage"><Share2 size={15} /><p>{usage}</p></div><button type="button" className="ex-open-example" onClick={() => onPreview(example)}>{example.content.name} 둘러보기<ArrowUpRight size={17} /></button><Link className="ex-use-example" href={exampleEditorHref(example.slug)} aria-label={`${example.content.name} 예시로 시작하기`}>이 예시로 시작하기</Link></div>
  </article>;
}
