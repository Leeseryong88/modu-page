"use client";
import Link from "next/link";
import type { BusinessExample } from "@/lib/examples";
import { exampleEditorHref } from "@/lib/start-path";
import { BusinessTemplate } from "./business-template";
import { Button } from "./ui/button";
import "./example-site.css";

export function ExampleSite({ example }: { example: BusinessExample }) {
  return <div className="example-page">
    <aside className="example-toolbar" aria-label="홈페이지 예시 안내"><div><Link href="/#examples">예시 목록</Link><span><strong>{example.category} 홈페이지 예시</strong><small>가상의 인물·공간 · 체험용 예시</small></span></div><Button asChild><Link href={exampleEditorHref(example.slug)}>이 예시로 시작하기</Link></Button></aside>
    <div id="main"><BusinessTemplate content={example.content} ownerId="example" exampleImages={example.imageSources} /></div>
  </div>;
}
