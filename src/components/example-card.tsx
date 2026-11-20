"use client";
import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Globe2, Maximize2, MessageCircle, Share2 } from "lucide-react";
import type { BusinessExample } from "@/lib/examples";
import { getExampleStory } from "@/lib/example-stories";
import { exampleEditorHref } from "@/lib/start-path";
import { ExampleThumbnail } from "./example-thumbnail";
import { InquiryDemo, ShareScene } from "./use-case-scenes";

const stages = [{ label: "홈페이지", icon: Globe2 }, { label: "공유 장면", icon: Share2 }, { label: "문의 체험", icon: MessageCircle }] as const;
export function ExampleCard({ example, onPreview }: { example: BusinessExample; onPreview: (example: BusinessExample) => void }) {
  const [step, setStep] = useState(0);
  const { usage, scene } = getExampleStory(example);
  return <article className="ex-card" aria-labelledby={`example-${example.slug}-title`} style={{ "--case-color": example.tone, "--sample-color": example.tone } as CSSProperties}>
    <div className="ex-card-stages" role="group" aria-label={`${example.content.name} 활용 과정`}>{stages.map(({ label, icon: Icon }, index) => <button type="button" key={label} aria-pressed={step === index} onClick={() => setStep(index)}><Icon size={15} />{label}</button>)}</div>
    <div className="ex-card-stage" key={step}>{step === 0 ? <button type="button" className="ex-preview-button" onClick={() => onPreview(example)} aria-label={`${example.content.name} 홈페이지 크게 둘러보기`}><ExampleThumbnail example={example} /><span className="ex-preview-hint"><Maximize2 size={15} />전체 홈페이지 보기</span></button> : step === 1 ? <ShareScene item={scene} onOpen={() => setStep(0)} /> : <InquiryDemo item={scene} />}</div>
    <div className="ex-card-copy"><div className="ex-card-title"><div><span>{example.category}</span><h3 id={`example-${example.slug}-title`}>{example.content.name}</h3></div><span className="ex-photo-count">사진 {example.content.projects.length + 1}장</span></div><p>{example.summary}</p><div className="ex-card-usage"><Share2 size={15} /><p>{usage}</p></div><button type="button" className="ex-open-example" onClick={() => onPreview(example)}>{example.content.name} 둘러보기<ArrowUpRight size={17} /></button><Link className="ex-use-example" href={exampleEditorHref(example.slug)} aria-label={`${example.content.name} 예시로 시작하기`}>이 예시로 시작하기</Link></div>
  </article>;
}
