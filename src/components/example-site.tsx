"use client";
import Link from "next/link";
import type { BusinessExample } from "@/lib/examples";
import { useAuth } from "./auth-provider";
import { BusinessTemplate } from "./business-template";
import { Button } from "./ui/button";
import "./example-site.css";

export function ExampleSite({ example }: { example: BusinessExample }) {
  const { user } = useAuth();
  return <div className="example-page">
    <aside className="example-toolbar" aria-label="홈페이지 예시 안내"><div><Link href="/#examples">예시 목록</Link><span><strong>{example.category} 홈페이지 예시</strong><small>가상 업체 · 사진과 정보는 데모용</small></span></div><Button asChild><Link href={user ? "/dashboard" : "/signup"}>나도 만들기</Link></Button></aside>
    <div id="main"><BusinessTemplate content={example.content} ownerId="example" exampleImages={example.imageSources} /></div>
  </div>;
}
