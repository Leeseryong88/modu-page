"use client";
import type { BusinessExample } from "@/lib/examples";
import { ExampleCollection } from "./example-carousel";
import "./site-examples.css";

export function SiteExamples({ onPreview }: { onPreview: (example: BusinessExample) => void }) {
  return <section id="examples" className="site-examples" aria-labelledby="examples-heading"><div className="marketing-shell">
    <div className="sx-heading"><div><p className="section-label">홈페이지 모습부터, 사용하는 순간까지</p><h2 id="examples-heading">다른 이야기, 다른 홈페이지.<br />나에게 맞는 시작을 찾아보세요.</h2></div><p>마음에 드는 디자인과 활용법을 한 카드에서.<br />사진을 누르면 이 화면에서 홈페이지 전체를 둘러볼 수 있어요.</p></div>
    <ExampleCollection onPreview={onPreview} />
    <p className="sx-disclosure">가상의 인물·공간을 담은 예시입니다. 사진은 생성 이미지이며, 문의 체험은 실제로 전송되지 않아요.</p>
    <div className="sx-next"><p>마음에 드는 모습을 찾았다면, 이제 내 이야기로 바꿔볼까요?</p><a href="#how-it-works">세 부분 조립해보기</a></div>
  </div></section>;
}
