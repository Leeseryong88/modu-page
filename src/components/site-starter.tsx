"use client";
import Link from "next/link";
import { useRef, useState, type CSSProperties } from "react";
import { FilePlus2, LayoutTemplate, Check, ImageIcon } from "lucide-react";
import { EXAMPLES, type BusinessExample } from "@/lib/examples";
import { api } from "@/lib/api-client";
import type { SiteRecord } from "@/lib/schema";
import { BrandLogo } from "./site-header";
import { ExampleThumbnail } from "./example-thumbnail";
import { ExamplePreviewDialog } from "./example-preview-dialog";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import "./site-starter.css";

const categories = ["전체", "개인·창작자", "전문가", "클래스·모임", "매장·비즈니스"] as const;
export function SiteStarter({ site, exampleSlug, onStarted, onContinue }: {
  site: SiteRecord; exampleSlug?: string; onStarted: (site: SiteRecord, exampleName?: string) => void; onContinue: () => void;
}) {
  const [category, setCategory] = useState<typeof categories[number]>("전체");
  const [selected, setSelected] = useState<BusinessExample | null>(() => EXAMPLES.find(item => item.slug === exampleSlug) ?? null);
  const [blankConfirm, setBlankConfirm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(exampleSlug && !EXAMPLES.some(item => item.slug === exampleSlug) ? "이 예시는 더 이상 제공하지 않아요. 아래에서 다른 예시를 선택해주세요." : "");
  const pending = useRef(false);
  const opener = useRef<HTMLElement | null>(null);
  const library = useRef<HTMLElement>(null);
  const replacing = site.revision > 0;
  const examples = category === "전체" ? EXAMPLES : EXAMPLES.filter(item => item.audience === category);
  function preview(example: BusinessExample) {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setError(""); setSelected(example);
  }
  async function start(example: BusinessExample | null) {
    if (pending.current) return;
    pending.current = true; setBusy(true); setError("");
    try {
      const next = await api<SiteRecord>("/api/site/start", { method: "POST", body: JSON.stringify({ exampleSlug: example?.slug ?? null, revision: site.revision, replaceDraft: replacing }) });
      window.history.replaceState(null, "", "/dashboard/editor");
      onStarted(next, example?.content.name);
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch (e) { setError((e as Error).message); }
    finally { pending.current = false; setBusy(false); }
  }
  const replacementNotice = replacing ? `현재 초안 ‘${site.draft.name || "작성 중인 홈페이지"}’의 내용을 바꿉니다. 공개 중인 홈페이지와 주소는 유지돼요.` : "사진·소개·활동 안내·디자인이 내 초안에 저장돼요. 예시 연락처는 비워두고, 공개는 직접 결정해요.";
  return <div className="site-starter">
    <header className="starter-header"><BrandLogo /><Link href="/dashboard">관리 화면</Link></header>
    <main id="main" className="starter-main">
      <div className="starter-intro"><span className="eyebrow">나만의 홈페이지, 첫걸음</span><h1>어떤 시작이 좋으세요?</h1><p>빈 페이지에 나의 이야기를 채우거나,<br />마음에 드는 예시를 골라 내 것으로 다듬어보세요.</p></div>
      {replacing && <div className="starter-existing"><div><strong>이미 작성한 홈페이지가 있어요.</strong><p>기존 내용을 이어서 편집하거나, 확인 후 새 구성으로 바꿀 수 있어요.</p></div><Button variant="outline" onClick={onContinue} disabled={busy}>기존 초안 이어서 편집</Button></div>}
      <div className="starter-options">
        <section className="starter-option"><span className="starter-option-icon"><FilePlus2 size={25} /></span><h2>처음부터 만들기</h2><p>나만의 구성이 떠오른다면.<br />상단·중단·하단을 하나씩 채워요.</p><Button variant="outline" onClick={() => replacing ? setBlankConfirm(true) : void start(null)} disabled={busy}>{busy && !selected ? "빈 페이지를 준비하고 있어요…" : "빈 페이지로 시작하기"}</Button></section>
        <section className="starter-option featured"><span className="starter-option-icon"><LayoutTemplate size={25} /></span><span className="starter-recommend">처음이라면 추천</span><h2>예시로 시작하기</h2><p>완성된 디자인에서 시작해요.<br />사진과 문구만 바꿔도 나다운 홈페이지로.</p><Button disabled={busy} onClick={() => { library.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }); library.current?.focus({ preventScroll: true }); }}>예시 {EXAMPLES.length}개 둘러보기</Button></section>
      </div>
      {error && !selected && !blankConfirm && <p className="feedback error" role="alert">{error}</p>}
      <section ref={library} tabIndex={-1} className="starter-library" aria-labelledby="starter-library-title">
        <div className="starter-library-heading"><div><span className="eyebrow">마음에 드는 출발점 찾기</span><h2 id="starter-library-title">어떤 모습으로 시작할까요?</h2></div><p><Check size={16} />사진과 문구 모두 수정 가능</p></div>
        <div className="starter-filters" role="group" aria-label="시작할 예시 카테고리">{categories.map(item => <button type="button" key={item} aria-pressed={category === item} disabled={busy} onClick={() => setCategory(item)}>{item}<span>{item === "전체" ? EXAMPLES.length : EXAMPLES.filter(example => example.audience === item).length}</span></button>)}</div>
        <p className="starter-count" role="status">{category} · {examples.length}개의 예시</p>
        <div className="starter-grid">{examples.map(example => <article key={example.slug} className="starter-example" style={{ "--sample-color": example.tone } as CSSProperties}>
          <button type="button" className="starter-thumbnail" onClick={() => preview(example)} disabled={busy} aria-label={`${example.content.name} 예시 미리보기`}><ExampleThumbnail example={example} /><span>전체 홈페이지 미리보기</span></button>
          <div className="starter-example-copy"><span>{example.category}</span><h3>{example.content.name}</h3><p>{example.summary}</p><div className="starter-example-meta"><ImageIcon size={15} />사진 {example.content.projects.length + 1}장 · 상단·중단·하단 포함</div><Button variant="outline" onClick={() => preview(example)} disabled={busy} aria-label={`${example.content.name} 예시 선택`}>이 예시 선택하기</Button></div>
        </article>)}</div>
      </section>
    </main>
    <ExamplePreviewDialog example={selected} onClose={() => setSelected(null)} opener={opener} busy={busy} footer={<div className="starter-preview-action"><div><strong>{replacing ? "현재 초안을 이 예시로 바꿀까요?" : "이 모습에서, 나의 이야기로."}</strong><p>{replacementNotice}</p>{error && <p className="field-error" role="alert">{error}</p>}</div><Button onClick={() => selected && void start(selected)} disabled={busy}>{busy ? "사진과 내용을 가져오고 있어요…" : replacing ? "초안을 이 예시로 바꾸기" : "이 예시로 시작하기"}</Button><span className="sr-only" role="status">{busy ? "예시 사진과 내용을 내 초안으로 복사하고 있어요." : ""}</span></div>} />
    <Dialog open={blankConfirm} onOpenChange={open => { if (!busy) setBlankConfirm(open); }}><DialogContent><DialogTitle>빈 페이지로 다시 시작할까요?</DialogTitle><DialogDescription>{replacementNotice}</DialogDescription><div className="dialog-actions"><Button variant="outline" onClick={() => setBlankConfirm(false)} disabled={busy}>취소</Button><Button onClick={() => void start(null)} disabled={busy}>{busy ? "준비 중…" : "초안을 빈 페이지로 바꾸기"}</Button></div>{error && <p className="field-error" role="alert">{error}</p>}</DialogContent></Dialog>
  </div>;
}
