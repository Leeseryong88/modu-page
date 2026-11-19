"use client";

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import { Check, ChevronDown, Globe2, ImagePlus, MessageCircle, Phone, Smartphone } from "lucide-react";
import { EXAMPLES } from "@/lib/examples";
import { BRAND } from "@/lib/brand";
import { useAuth } from "./auth-provider";
import { BrandLogo, SiteHeader } from "./site-header";
import { Button } from "./ui/button";
import { ExampleCarousel } from "./example-carousel";
import "./landing.css";
import "./inquiries.css";
import "./landing-revision.css";

function QuickTry() {
  const [selected, setSelected] = useState("interior");
  const [name, setName] = useState("우리공간 인테리어");
  const example = EXAMPLES.find(item => item.slug === selected)!;
  return <div className="quick-try">
    <div className="quick-try-form">
      <p className="section-label">잠깐, 직접 바꿔볼까요?</p>
      <label htmlFor="try-business-name">내 가게 이름</label>
      <input id="try-business-name" value={name} onChange={event => setName(event.target.value)} maxLength={30} placeholder="가게 이름을 적어보세요" aria-describedby="try-help" />
      <p className="try-field-label" id="try-category-label">어떤 일을 하시나요?</p>
      <div className="try-categories" role="group" aria-labelledby="try-category-label">{EXAMPLES.map(item => <button key={item.slug} type="button" aria-pressed={selected === item.slug} onClick={() => setSelected(item.slug)}>{item.category}</button>)}</div>
      <p className="try-help" id="try-help">이름과 업종을 바꾸면 옆의 모습도 바뀌어요.<br />이곳은 입력 체험이며, 내용은 저장되지 않아요.</p>
    </div>
    <div className="try-result" style={{ "--example-color": example.tone } as CSSProperties}>
      <div className="try-result-bar"><Globe2 size={15} /><span>내 가게 홈페이지 미리보기</span></div>
      <img src={example.hero} alt={`${example.category} 소개용 예시 사진`} width={1536} height={1024} loading="lazy" />
      <div className="try-result-copy"><span>{example.category}</span><h3 aria-live="polite">{name.trim() || "내 가게 이름"}</h3><p>{example.content.tagline}</p><span className="try-contact"><Phone size={14} />전화 문의</span><span className="try-contact secondary"><MessageCircle size={14} />카카오톡 상담</span></div>
    </div>
  </div>;
}

const questions = [
  { title: "컴퓨터나 디자인을 잘 몰라도 만들 수 있나요?", answer: "네. 빈 화면을 디자인할 필요 없이, 안내에 따라 가게 이름과 소개, 연락처를 입력하고 사진을 올리면 됩니다. 작성 중인 모습은 미리보기로 바로 확인할 수 있어요." },
  { title: "홈페이지를 만들면 어떻게 고객에게 보여주나요?", answer: "원하는 주소를 정해 공개한 뒤, 그 주소를 복사해 카카오톡이나 SNS 프로필, 명함 등에 공유하세요. 고객은 회원가입 없이 내 홈페이지를 볼 수 있어요." },
  { title: "견적이나 주문 문의는 어떻게 받나요?", answer: "고객이 공개 홈페이지의 문의 양식에 이름, 연락처, 내용을 남기면 별도의 문의함에 접수돼요. 사장님만 내용을 볼 수 있고, 상담 상태와 내부 메모를 관리할 수 있어요. 전화·카카오톡 연결도 함께 제공해요." },
  { title: "공개한 뒤에 사진이나 내용을 바꿀 수 있나요?", answer: "네. 관리 화면에서 수정하고 ‘공개 내용 업데이트’를 누르면 반영돼요. 임시저장한 내용은 나만 확인할 수 있고, 필요하면 홈페이지를 비공개로 바꿀 수도 있어요." },
];

export function Landing() {
  const { user } = useAuth();
  const createHref = user ? "/dashboard" : "/signup";
  return <div className="landing-page"><SiteHeader /><main id="main">
    <section className="shop-hero marketing-shell">
      <div className="shop-hero-copy"><p className="section-label">인테리어부터, 우리 동네의 모든 사업까지.</p>
        <h1>우리 업체 홈페이지,<br /><em>직접 만들고</em><br />문의까지 받아보세요.</h1>
        <p className="shop-hero-description">작업 사진과 업체 정보만 넣으면 시작할 수 있어요.<br className="wide-only" /> 내 주소로 공개하고, <strong>견적 문의와 전화 상담</strong>을 받아보세요.</p>
        <div className="shop-hero-actions"><Button asChild><Link href={createHref}>내 가게 홈페이지 만들기</Link></Button><Link className="marketing-text-link" href="#examples">업종별 예시 둘러보기</Link></div>
        <p className="hero-reassurance"><Check size={16} />코딩 없이 · 디자인 지식 없이 · 사진과 정보만으로</p>
      </div>
      <figure className="creation-hero-figure"><img src="/images/site-creation-hero.webp" alt="인테리어 홈페이지를 중심으로 카페와 꽃집 홈페이지가 함께 완성되는 모습. 사진과 내용을 넣어 각 업종의 홈페이지를 만드는 과정을 표현한 이미지." width={1448} height={1086} fetchPriority="high" /><figcaption><strong>사진과 정보가, 우리 업체 홈페이지로.</strong><span>홈페이지 제작 과정을 표현한 이미지입니다.</span></figcaption></figure>
    </section>
    <div className="benefit-strip marketing-shell"><p><ImagePlus size={20} /><span>사진과 소개로 <strong>가게를 알리고</strong></span></p><p><Globe2 size={20} /><span>하나의 주소로 <strong>쉽게 공유하고</strong></span></p><p><Phone size={20} /><span>문의 양식과 전화로 <strong>고객을 만나세요</strong></span></p></div>

    <section id="examples" className="examples-section"><div className="marketing-shell">
      <div className="marketing-section-head"><div><p className="section-label">WEBSITE COLLECTION</p><h2>우리 업체라면,<br />이런 홈페이지 어때요?</h2></div><p>인테리어, 카페, 꽃집, 이사업체.<br />실제 홈페이지처럼 열어보고 직접 둘러보세요.</p></div>
      <ExampleCarousel />
      <p className="example-disclosure">이해를 돕기 위해 만든 가상 업체의 예시입니다. 사진과 정보는 데모용이에요.</p>
    </div></section>

    <section id="how-it-works" className="make-section"><div className="marketing-shell"><div className="marketing-section-head"><div><p className="section-label">처음이어도 괜찮아요</p><h2>가게 이름과 사진부터.<br />한 단계씩 따라오면 완성.</h2></div><p>안내에 따라 적고, 미리 보고, 준비되면 공개하세요.<br />작성 중에는 임시저장하고 나중에 이어갈 수 있어요.</p></div><QuickTry />
      <ol className="making-steps"><li><span>정보 입력</span><h3>우리 가게를 알려주세요</h3><p>상호명, 소개, 연락처를 적고<br />메뉴·상품·작업 사진을 올려요.</p></li><li><span>디자인 확인</span><h3>완성될 모습을 살펴봐요</h3><p>포인트 색상을 고르고<br />PC와 휴대폰 화면을 확인해요.</p></li><li><span>주소 설정·공개</span><h3>이제 고객에게 공유하세요</h3><p>내 주소를 정하고 공개하면 끝.<br />SNS나 카카오톡에 링크를 보내세요.</p></li></ol>
    </div></section>

    <section className="contact-story marketing-shell"><div className="contact-story-copy"><p className="section-label">홈페이지와 함께, 별도의 문의함까지</p><h2>전화 놓쳐도,<br />고객의 문의는 남도록.</h2><p>고객은 홈페이지에 문의를 남기고,<br />사장님은 문의함에서 모아 확인하세요.</p><ul><li><Check size={18} />견적·예약·주문 문의를 한곳에서</li><li><Check size={18} />새 문의·상담 중·완료 상태별 집계</li><li><Check size={18} />연락처 확인과 나만 보는 상담 메모</li></ul><p className="contact-method-note">홈페이지 편집과 따로 관리해요. 전화와 카카오톡도 연결할 수 있어요.</p><Link href="/examples/interior#inquiry" className="marketing-text-link">예시 홈페이지에서 문의 양식 체험하기</Link></div>
      <div className="landing-inbox-demo" aria-label="문의함 기능 미리보기"><div className="inbox-demo-heading"><div><span>기능 미리보기</span><h3>우리 업체 문의함</h3></div><MessageCircle size={25} strokeWidth={1.4} /></div><div className="inbox-demo-counts"><div><span>전체 문의</span><strong>3</strong></div><div><span>새 문의</span><strong>1</strong></div><div><span>상담 중</span><strong>1</strong></div><div><span>완료</span><strong>1</strong></div></div><div className="inbox-demo-row"><span className="inquiry-badge status-new">새 문의</span><strong>거실 부분 리모델링 문의</strong><span>오늘</span></div><div className="inbox-demo-row"><span className="inquiry-badge status-progress">상담 중</span><strong>주방 수납장 견적 상담</strong><span>어제</span></div><div className="inbox-demo-row"><span className="inquiry-badge status-done">완료</span><strong>아파트 전체 시공 문의</strong><span>어제</span></div><p>설명을 위한 예시 화면이며 실제 접수 내역이 아닙니다.</p></div>
    </section>

    <section id="questions" className="faq-section marketing-shell"><div><p className="section-label">시작 전 궁금한 점</p><h2>사장님들이<br />궁금해하실 이야기.</h2></div><div className="faq-list">{questions.map(question => <details key={question.title}><summary>{question.title}<ChevronDown size={20} /></summary><p>{question.answer}</p></details>)}</div></section>
    <section className="marketing-end"><div className="marketing-shell"><div><p>카페도, 꽃집도, 동네의 든든한 업체도.</p><h2>내 사업의 첫 홈페이지,<br />여기서 시작하세요.</h2></div><div><Button asChild><Link href={createHref}>내 가게 홈페이지 만들기</Link></Button><span><Smartphone size={16} />고객의 휴대폰에서도 보기 좋게.</span></div></div></section>
  </main><footer className="marketing-footer marketing-shell"><BrandLogo /><p>작은 가게의 일을, 더 많은 사람에게.</p><span>© {BRAND.name}</span></footer></div>;
}
