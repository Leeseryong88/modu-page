"use client";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { EXAMPLES, type BusinessExample } from "@/lib/examples";
import { ExampleCard } from "./example-card";
import "./example-gallery.css";

const categories = ["전체", "개인·창작자", "전문가", "클래스·모임", "매장·비즈니스"] as const;
type Category = typeof categories[number];

export function ExampleCollection({ onPreview }: { onPreview: (example: BusinessExample) => void }) {
  const [category, setCategory] = useState<Category>("전체");
  const [position, setPosition] = useState({ index: 0, start: true, end: false });
  const trackRef = useRef<HTMLDivElement>(null);
  const examples = category === "전체" ? EXAMPLES : EXAMPLES.filter(item => item.audience === category);
  const carousel = category !== "전체";
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const update = () => {
      const cards = [...track.children] as HTMLElement[];
      const left = track.scrollLeft;
      let index = 0;
      let distance = Infinity;
      cards.forEach((card, i) => { const next = Math.abs(Math.min(card.offsetLeft, track.scrollWidth - track.clientWidth) - left); if (next < distance) { index = i; distance = next; } });
      setPosition({ index: left + track.clientWidth >= track.scrollWidth - 2 ? cards.length - 1 : index, start: left < 2, end: left + track.clientWidth >= track.scrollWidth - 2 });
    };
    track.scrollTo({ left: 0, behavior: "instant" }); update();
    track.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update); observer.observe(track);
    return () => { track.removeEventListener("scroll", update); observer.disconnect(); };
  }, [category]);
  function move(direction: number) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[Math.max(0, Math.min(examples.length - 1, position.index + direction))] as HTMLElement;
    track.scrollTo({ left: card.offsetLeft, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    if (!carousel || event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1);
  }
  return <div className="example-library">
    <div className="ex-filters" role="group" aria-label="홈페이지 예시 카테고리">{categories.map(label => <button type="button" key={label} aria-pressed={category === label} onClick={() => setCategory(label)}>{label}<span>{label === "전체" ? EXAMPLES.length : EXAMPLES.filter(item => item.audience === label).length}</span></button>)}</div>
    <div className="ex-collection-heading"><p role="status">{category === "전체" ? `서로 다른 ${examples.length}개의 홈페이지를 모두 둘러보세요.` : `${category} · ${examples.length}개의 홈페이지`}<span>{carousel ? "옆으로 넘겨 디자인과 활용법을 비교해보세요." : "카드 안에서 공유 장면과 문의 체험도 살펴볼 수 있어요."}</span></p>{carousel && <div className="ex-carousel-controls"><button type="button" aria-label="이전 예시" disabled={position.start} onClick={() => move(-1)}><ArrowLeft size={18} /></button><span aria-live="polite">{position.end ? examples.length : position.index + 1} / {examples.length}</span><button type="button" aria-label="다음 예시" disabled={position.end} onClick={() => move(1)}><ArrowRight size={18} /></button></div>}</div>
    <div ref={trackRef} className={`ex-card-track ${carousel ? "is-carousel" : "is-grid"}`} role="region" aria-label={`${category} 홈페이지 목록`} aria-roledescription={carousel ? "캐러셀" : undefined} tabIndex={carousel ? 0 : undefined} onKeyDown={navigate}>{examples.map(example => <ExampleCard key={example.slug} example={example} onPreview={onPreview} />)}</div>
  </div>;
}
