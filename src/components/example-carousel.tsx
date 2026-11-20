"use client";
import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight, Globe2, Plus } from "lucide-react";
import { EXAMPLES } from "@/lib/examples";
import { SECTION_TEMPLATES } from "@/lib/section-layouts";
import "./example-collection.css";

const filters = ["전체", "개인·창작자", "전문가", "클래스·모임", "매장·비즈니스"] as const;
export function ExampleCarousel() {
  const [filter, setFilter] = useState<typeof filters[number]>("전체");
  const [expanded, setExpanded] = useState(false);
  const matching = EXAMPLES.filter(item => filter === "전체" || item.audience === filter);
  const shown = expanded ? matching : matching.slice(0, 4);
  return <div className="collection">
    <div className="collection-toolbar"><div className="collection-filters" role="group" aria-label="홈페이지 예시 용도 선택">{filters.map(value => <button key={value} aria-pressed={filter === value} onClick={() => { setFilter(value); setExpanded(false); }}>{value}</button>)}</div><span aria-live="polite">{matching.length}개의 예시</span></div>
    <div className="collection-grid">{shown.map(item => <Link href={`/examples/${item.slug}`} key={item.slug} className="collection-card" style={{ "--sample-color": item.tone } as CSSProperties}>
      <div className="collection-window"><div className="collection-address"><span aria-hidden="true"><i /><i /><i /></span><Globe2 size={12} />{item.content.name}의 홈페이지</div>
        <div className={`collection-preview top-${item.content.layout.top} middle-${item.content.layout.middle}`} aria-hidden="true">
          <div className="collection-nav"><strong>{item.content.name}</strong><span>소개　이야기　문의</span></div>
          <div className="collection-hero"><div><span>{item.category}</span><strong>{item.content.tagline}</strong><b>더 알아보기 ↗</b></div><img src={item.hero} alt="" width={1440} height={960} loading="lazy" /></div>
          <div className="collection-content">{item.content.layout.middle === "gallery" ? <><img src={item.detail} alt="" width={600} height={400} loading="lazy" /><img src={item.hero} alt="" width={600} height={400} loading="lazy" /><span>선택한 작업과 이야기</span></> : item.content.services.slice(0, 3).map((s, i) => <div key={s.id}><span>0{i+1}</span><strong>{s.title}</strong><i /></div>)}</div>
        </div><span className="collection-open">홈페이지 열어보기 <ArrowUpRight size={17} /></span>
      </div>
      <div className="collection-caption"><div><span>{item.category}</span><h3>{item.content.name}</h3></div><ArrowUpRight size={23} /></div><p>{item.summary}</p>
      <div className="collection-recipe">{(["top", "middle", "bottom"] as const).map((region, i) => <span key={region}>{["상", "중", "하"][i]} · {SECTION_TEMPLATES[region].find(t => t.id === item.content.layout[region])?.name}</span>)}</div>
    </Link>)}</div>
    {!expanded && matching.length > 4 && <button className="collection-more" onClick={() => setExpanded(true)}><Plus size={18} />예시 {matching.length - 4}개 더 보기</button>}
  </div>;
}
