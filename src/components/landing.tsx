"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { getExample, type BusinessExample } from "@/lib/examples";
import { ArrowUpRight, Check, ChevronDown, Smartphone } from "lucide-react";
import { useAuth } from "./auth-provider";
import { SiteHeader } from "./site-header";
import { Button } from "./ui/button";
import { SiteExamples } from "./site-examples";
import { HomepageBenefits } from "./homepage-benefits";
import { ExamplePreviewDialog } from "./example-preview-dialog";
import { CompanyFooter } from "./company-footer";
import { AssemblyDemo } from "./assembly-demo";
import "./landing.css";
import "./inquiries.css";
import "./landing-revision.css";
import "./landing-inclusive.css";

const questions = [
  { title: "사업자가 아니어도 사용할 수 있나요?", answer: "물론이에요. 개인 이력서와 포트폴리오, 프리랜서 소개, 클래스나 소모임 등 다양한 용도로 쓸 수 있어요. 전화번호와 활동 지역은 선택사항이며, 번호를 공개하지 않고 온라인 문의만 받을 수도 있어요." },
  { title: "컴퓨터나 디자인을 잘 몰라도 만들 수 있나요?", answer: "네. 처음부터 만들거나 마음에 드는 예시의 사진·문구·디자인을 가져와 시작할 수 있어요. 상단·중단·하단을 눌러 내 내용으로 바꾸고, 각 부분의 모양도 자유롭게 선택하세요." },
  { title: "홈페이지를 만들면 어떻게 공유하나요?", answer: "원하는 주소를 정해 공개한 뒤, 그 주소를 복사해 카카오톡이나 SNS 프로필, 명함 등에 공유하세요. 방문자는 회원가입 없이 내 홈페이지를 볼 수 있어요." },
  { title: "협업이나 상담, 참여 문의는 어떻게 받나요?", answer: "방문자가 공개 홈페이지의 문의 양식에 이름, 연락처, 내용을 남기면 별도의 문의함에 접수돼요. 홈페이지 주인만 내용을 볼 수 있고, 상담 상태와 내부 메모를 관리할 수 있어요. 전화·카카오톡 연결도 함께 제공해요." },
  { title: "공개한 뒤에 사진이나 내용을 바꿀 수 있나요?", answer: "네. 관리 화면에서 수정하고 ‘공개 내용 업데이트’를 누르면 반영돼요. 임시저장한 내용은 나만 확인할 수 있고, 필요하면 홈페이지를 비공개로 바꿀 수도 있어요." },
];

export function Landing() {
  const { user } = useAuth();
  const createHref = user ? "/dashboard/editor" : "/signup?next=%2Fdashboard%2Feditor";
  const [previewExample, setPreviewExample] = useState<BusinessExample | null>(null);
  const previewOpener = useRef<HTMLElement | null>(null);
  function openExample(example: BusinessExample) { previewOpener.current = document.activeElement as HTMLElement; setPreviewExample(example); }
  return <div className="landing-page"><SiteHeader /><main id="main">
    <section id="intro" className="shop-hero marketing-shell">
      <div className="shop-hero-copy"><p className="section-label">나의 일도, 취향도, 새로운 시작도.</p>
        <h1>내 이야기가 시작되는<br /><em>나만의 홈페이지.</em></h1>
        <p className="shop-hero-description">포트폴리오, 전문 서비스, 클래스, 그리고 우리 가게까지.<br className="wide-only" /> 세 부분을 조립해 <strong>나를 보여주는 공간</strong>을 만들어요.</p>
        <div className="shop-hero-actions"><Button asChild><Link href={createHref}>내 홈페이지 만들기</Link></Button><a className="marketing-text-link" href="#examples">어떤 페이지를 만들 수 있나요?</a></div>
        <p className="hero-reassurance"><Check size={16} />코딩 없이 · 세 부분을 조립하고 · 내 주소로 공유</p>
      </div>
      <div className="inclusive-hero-art" aria-label="포트폴리오, 전문가, 클래스 홈페이지 예시"><span className="inclusive-orbit" aria-hidden="true" /><button type="button" onClick={() => openExample(getExample("portfolio")!)} aria-label="김하늘 포트폴리오 예시 크게 보기" className="inclusive-main-card"><div className="inclusive-browser"><i /><i /><i /><span>하늘의 포트폴리오</span></div><img src="/images/use-cases/creative-work.webp" alt="종이와 오브제로 펼쳐낸 디자이너의 창작 작업" width={1440} height={960} fetchPriority="high" /><div><span>DESIGNER · MAKER · EXPLORER</span><h2>작은 발견이,<br />나만의 작업으로.</h2><p>김하늘의 포트폴리오 <ArrowUpRight size={17} /></p></div></button><button type="button" onClick={() => openExample(getExample("professional")!)} aria-label="서윤 세무사 예시 크게 보기" className="inclusive-side-card inclusive-pro"><img src="/images/use-cases/professional.webp" alt="밝은 공간에서 이야기를 나누는 전문가와 상담자" width={600} height={400} /><div><span>전문가 · 상담</span><strong>첫 상담의 시작을<br />편안하게.</strong><ArrowUpRight size={17} /></div></button><button type="button" onClick={() => openExample(getExample("workshop")!)} aria-label="주말의 작업실 예시 크게 보기" className="inclusive-side-card inclusive-class"><img src="/images/use-cases/workshop.webp" alt="종이 공예를 함께 즐기는 클래스 참여자들" width={600} height={400} /><div><span>클래스 · 모임</span><strong>좋아하는 일을,<br />함께하는 시간.</strong><ArrowUpRight size={17} /></div></button><span className="inclusive-art-note"><Check size={14} />서로 다른 이야기, 서로 다른 홈페이지.</span></div>
    </section>
    <HomepageBenefits onPreview={openExample} />

    <SiteExamples onPreview={openExample} />

    <section id="how-it-works" className="make-section"><div className="marketing-shell"><div className="marketing-section-head"><div><p className="section-label">처음이어도 괜찮아요</p><h2>세 부분을 눌러,<br />내 이야기로 완성하세요.</h2></div><p>화면을 누르고, 열린 창에서 내용을 채우세요.<br />작성 중에는 임시저장하고 나중에 이어갈 수 있어요.</p></div><AssemblyDemo />
      <ol className="making-steps"><li><span>01 · 시작점 고르기</span><h3>처음부터, 또는 예시부터</h3><p>빈 페이지로 시작하거나 예시를 골라요.<br />예시의 사진·문구·디자인을 가져와요.</p></li><li><span>02 · 내 내용으로 바꾸기</span><h3>눌러서 나답게 다듬어요</h3><p>상단·중단·하단에서 사진과 소개를 바꾸고<br />PC·휴대폰 화면을 확인해요.</p></li><li><span>03 · 저장하고 공개하기</span><h3>내 주소로 세상과 만나요</h3><p>초안을 저장하고, 준비되면 공개해요.<br />명함·SNS·이력서에 주소를 담으세요.</p></li></ol>
    </div></section>

    <section id="questions" className="faq-section marketing-shell"><div><p className="section-label">시작 전 궁금한 점</p><h2>시작하는 누구나<br />궁금할 이야기.</h2></div><div className="faq-list">{questions.map(question => <details key={question.title}><summary>{question.title}<ChevronDown size={20} /></summary><p>{question.answer}</p></details>)}</div></section>
    <section className="marketing-end"><div className="marketing-shell"><div><p>내가 하는 일, 좋아하는 것, 함께하고 싶은 이야기.</p><h2>나만의 첫 홈페이지,<br />여기서 시작하세요.</h2></div><div><Button asChild><Link href={createHref}>내 홈페이지 만들기</Link></Button><span><Smartphone size={16} />휴대폰에서도 나답게, 보기 좋게.</span></div></div></section>
  </main><CompanyFooter /><ExamplePreviewDialog example={previewExample} onClose={() => setPreviewExample(null)} opener={previewOpener} /></div>;
}
