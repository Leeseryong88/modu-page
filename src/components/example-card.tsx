"use client";
import type { CSSProperties } from "react";
import { Maximize2 } from "lucide-react";
import type { BusinessExample } from "@/lib/examples";
import { ExampleThumbnail } from "./example-thumbnail";

export function ExampleCard({ example, onPreview }: { example: BusinessExample; onPreview: (example: BusinessExample) => void }) {
  return <article className="ex-card" aria-label={`${example.content.name} 홈페이지 예시`} style={{ "--case-color": example.tone, "--sample-color": example.tone } as CSSProperties}>
    <div className="ex-card-stage"><button type="button" className="ex-preview-button" onClick={() => onPreview(example)} aria-label={`${example.content.name} 홈페이지 크게 둘러보기`}><ExampleThumbnail example={example} /><span className="ex-preview-hint"><Maximize2 size={15} />전체 홈페이지 보기</span></button></div>
  </article>;
}
