"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Globe2 } from "lucide-react";
import { EXAMPLES } from "@/lib/examples";

const examples = ["interior", "cafe", "florist", "moving"].map(slug => EXAMPLES.find(item => item.slug === slug)!);

export function ExampleCarousel() {
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const update = () => {
      if (element.scrollLeft >= element.scrollWidth - element.clientWidth - 4 && element.scrollLeft > 0) { setActive(examples.length - 1); return; }
      const left = element.getBoundingClientRect().left;
      const distances = Array.from(element.children).map(child => Math.abs(child.getBoundingClientRect().left - left));
      setActive(distances.indexOf(Math.min(...distances)));
    };
    element.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update); observer.observe(element); update();
    return () => { element.removeEventListener("scroll", update); observer.disconnect(); };
  }, []);
  function go(index: number) {
    const element = track.current, child = element?.children[index];
    if (!element || !child) return;
    element.scrollTo({ left: element.scrollLeft + child.getBoundingClientRect().left - element.getBoundingClientRect().left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  return <div className="example-carousel" role="region" aria-roledescription="캐러셀" aria-label="업종별 예시 홈페이지">
    <div className="example-carousel-toolbar"><p>옆으로 넘겨보고, 마음에 드는 홈페이지를 열어보세요.</p><div><span aria-live="polite">{String(active + 1).padStart(2, "0")} <span>/ 04</span></span><button aria-label="이전 예시" disabled={active === 0} onClick={() => go(active - 1)}><ChevronLeft size={19} /></button><button aria-label="다음 예시" disabled={active === examples.length - 1} onClick={() => go(active + 1)}><ChevronRight size={19} /></button></div></div>
    <div className="example-carousel-track" ref={track} tabIndex={0} aria-label="좌우 방향키로 예시 넘기기" onKeyDown={event => { if (event.target !== event.currentTarget) return; if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); go(Math.min(examples.length - 1, Math.max(0, active + (event.key === "ArrowRight" ? 1 : -1)))); } }}>
      {examples.map((example, index) => <Link href={`/examples/${example.slug}`} key={example.slug} className="example-slide" style={{ "--example-color": example.tone } as CSSProperties} aria-label={`${example.category} ${example.content.name} 예시 사이트 열기`}>
        <div className="sample-browser"><div className="sample-address"><Globe2 size={12} /><span>{example.content.name} · 홈페이지 예시</span><span>0{index + 1}</span></div>
          <div className="sample-site"><div className="sample-navigation"><strong>{example.content.name}</strong><span>소개　서비스　갤러리　문의</span></div>
            <div className="sample-hero"><div><span>{example.category} · {example.content.region}</span><strong>{example.content.name}</strong><p>{example.content.tagline}</p><span className="sample-inquiry">문의 남기기</span></div><img src={example.hero} alt="" width={1536} height={1024} loading="lazy" /></div>
            <div className="sample-services"><span>OUR SERVICES</span><div>{example.content.services.slice(0, 3).map((service, i) => <p key={service.id}><span>0{i + 1}</span><strong>{service.title}</strong></p>)}</div></div>
            <div className="sample-gallery"><div><span>OUR WORK</span><strong>{example.slug === "interior" ? "공간에 담은 우리의 생각" : "우리의 일을 소개합니다"}</strong></div><img src={example.detail} alt="" width={1536} height={1024} loading="lazy" /><img src={example.hero} alt="" width={1536} height={1024} loading="lazy" /></div>
          </div>
        </div>
        <div className="example-slide-caption"><div><span>{example.category}</span><h3>{example.content.name}</h3></div><span>예시 사이트 열기 ↗</span></div>
      </Link>)}
    </div>
  </div>;
}
