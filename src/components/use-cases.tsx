"use client";

import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import Link from "next/link";
import { BriefcaseBusiness, Check, CheckCheck, CreditCard, FileText, Globe2, Layers3, Mail, MessageCircle, MousePointer2, Palette, Pencil, Send, ShieldCheck, Sparkles, Store, Users, X } from "lucide-react";
import { COLORS } from "@/lib/brand";
import { USE_CASES, type UseCase, type UseCaseId } from "@/lib/use-cases";
import { useAuth } from "./auth-provider";
import { SiteHeader } from "./site-header";
import { CompanyFooter } from "./company-footer";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import "./landing.css";
import "./landing-revision.css";
import "./use-cases.css";

const EXAMPLE_SLUGS: Record<UseCaseId, string> = { "business-card": "interior", professional: "professional", portfolio: "portfolio", freelance: "photographer", class: "workshop", "local-shop": "cafe" };
const CASE_ICONS = { "business-card": CreditCard, professional: BriefcaseBusiness, portfolio: FileText, freelance: Palette, class: Users, "local-shop": Store };
function caseTheme(item: UseCase, color?: string): CSSProperties { return { "--case-color": color || item.color, "--case-soft": item.soft } as CSSProperties; }

function MiniWebsite({ item, name, expanded = false, onContact }: { item: UseCase; name?: string; expanded?: boolean; onContact: () => void }) {
  const creative = item.id === "portfolio" || item.id === "freelance";
  const photo = item.id === "business-card" ? "/images/interior-editorial.webp" : item.image;
  return <div className={`uc-mini-site ${creative ? "creative" : ""} ${expanded ? "expanded" : ""}`}>
    <div className="uc-mini-browser"><span aria-hidden="true"><i /><i /><i /></span><Globe2 size={13} /><span>나만의 홈페이지 · 예시 화면</span></div>
    <div className="uc-mini-nav"><strong>{name || item.name}</strong><span>{item.offerings[0]}<span>{item.offerings[1]}</span></span></div>
    <div className="uc-mini-hero"><div><span>{item.role}</span><h3>{name || item.name}</h3><p>{item.tagline}</p><button className="uc-demo-button" onClick={onContact}>{item.inquiryLabel}<MessageCircle size={14} /></button></div><img src={photo} alt={item.imageAlt} width={1440} height={960} loading="lazy" /></div>
    <div className="uc-mini-topics">{item.offerings.map(label => <span key={label}>{label}</span>)}</div>
    {expanded && <><section className="uc-mini-about"><span>나를 소개하는 공간</span><h4>{creative ? "결과물 뒤의 이야기도 함께." : "처음 만나도, 조금 더 가깝게."}</h4><p>{item.about}</p></section><div className="uc-mini-work"><img src={photo} alt={item.imageAlt} width={1440} height={960} loading="lazy" /><div><span>{item.offerings[1]}</span><h4>{creative ? "어떤 고민에서 시작했는지." : "사진으로 먼저 만나보세요."}</h4><p>{creative ? "맡았던 역할과 과정, 완성한 결과를 사진과 글로 보여주세요." : "공간과 작업, 서비스의 모습을 보여주면 내 일을 더 쉽게 전할 수 있어요."}</p></div></div><div className="uc-mini-contact"><div><h4>이야기를 들려주세요.</h4><p>궁금한 점이나 함께하고 싶은 일을 남겨주세요.</p></div><button className="uc-demo-button" onClick={onContact}>{item.inquiryLabel}<MessageCircle size={15} /></button></div></>}
  </div>;
}

function ShareScene({ item, onOpen }: { item: UseCase; onOpen: () => void }) {
  const Icon = CASE_ICONS[item.id];
  return <div className={`uc-share-scene share-${item.id}`}>
    <img className="uc-scene-photo" src={item.image} alt={item.imageAlt} width={1440} height={960} loading="lazy" />
    <div className="uc-share-card"><span className="uc-channel"><Icon size={16} />{item.channel}</span><strong>{item.shareTitle}</strong><p>{item.shareText}</p><button className="uc-share-link" onClick={onOpen}><Globe2 size={16} /><span>{item.name}의 홈페이지</span><MousePointer2 size={16} /></button><small>링크를 눌러 다음 장면으로</small></div>
  </div>;
}

function InquiryDemo({ item }: { item: UseCase }) {
  const [sent, setSent] = useState(false);
  return <div className="uc-inquiry-demo">
    <span className="uc-demo-tag">전송 없는 체험</span>
    {sent ? <div className="uc-inbox-result" role="status"><span className="uc-result-icon"><CheckCheck size={27} /></span><h3>문의함에서 이렇게 만나요.</h3><p>홈페이지를 보고 남긴 관심이<br />다음 대화의 시작이 됩니다.</p><div className="uc-inbox-sample"><div><span>새 문의</span><span>예시</span></div><strong>{item.inquiryTitle}</strong><p>{item.inquiryMessage}</p><div className="uc-inbox-footer"><MessageCircle size={15} />연락처 확인 · 상담 상태 · 내부 메모</div></div><p className="uc-demo-safe">체험 완료 · 실제 문의는 전송되지 않았어요.</p><button className="uc-quiet-button" onClick={() => setSent(false)}>처음부터 다시 보기</button></div>
      : <div className="uc-inquiry-sheet"><MessageCircle size={25} /><h3>다음 대화를 시작해볼까요?</h3><p>방문자는 홈페이지를 둘러본 뒤<br />궁금한 내용을 남길 수 있어요.</p><div className="uc-sample-field"><span>남기고 싶은 이야기 · 예시</span><strong>{item.inquiryTitle}</strong></div><div className="uc-sample-field"><span>문의 내용 · 예시</span><p>{item.inquiryMessage}</p></div><button className="uc-demo-button" onClick={() => setSent(true)}><Send size={16} />예시 문의 보내보기</button><small>실제 개인정보 입력이나 전송 없이 체험해요.</small></div>}
  </div>;
}

export function UseCasesPage() {
  const { user } = useAuth();
  const createHref = user ? "/dashboard/editor" : "/signup";
  const [selected, setSelected] = useState<UseCaseId>("business-card");
  const [step, setStep] = useState(0);
  const [demo, setDemo] = useState<UseCase | null>(null);
  const [demoContact, setDemoContact] = useState(false);
  const [personalCaseId, setPersonalCaseId] = useState<UseCaseId>("portfolio");
  const [personalName, setPersonalName] = useState("");
  const [personalColor, setPersonalColor] = useState("#233c52");
  const [personalOpen, setPersonalOpen] = useState(false);
  const demoBody = useRef<HTMLDivElement | null>(null);
  useEffect(() => { demoBody.current?.scrollTo({ top: 0 }); }, [demoContact, demo?.id]);
  const opener = useRef<HTMLElement | null>(null);
  const personalOpener = useRef<HTMLElement | null>(null);
  const selectedCase = USE_CASES.find(item => item.id === selected)!;
  const personalCase = USE_CASES.find(item => item.id === personalCaseId)!;
  function chooseCase(id: UseCaseId, reveal = false) {
    setSelected(id); setStep(0);
    if (reveal) { document.getElementById(`case-tab-${id}`)?.focus({ preventScroll: true }); document.getElementById("scenarios")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }); }
  }
  function tabKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? USE_CASES.length - 1 : (index + (event.key === "ArrowRight" ? 1 : -1) + USE_CASES.length) % USE_CASES.length;
    chooseCase(USE_CASES[next].id); document.getElementById(`case-tab-${USE_CASES[next].id}`)?.focus();
  }
  function openDemo(item: UseCase) { opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; setDemoContact(false); setDemo(item); }

  return <div className="landing-page use-cases-page"><SiteHeader /><main id="main">
    <section className="uc-hero marketing-shell"><div className="uc-hero-copy"><p className="uc-eyebrow"><span />나를 알리는, 조금 더 멋진 방법</p><h1>한 장의 명함에,<br />다 담지 못한 <em>나를.</em></h1><p className="uc-hero-description">내 일과 경험, 내가 만든 것들.<br />홈페이지 하나로 보여주고,<br className="uc-mobile-break" /> 새로운 만남으로 이어보세요.</p><div className="uc-hero-actions"><a className="uc-primary-link" href="#scenarios">나에게 맞는 활용법 찾기</a><Link className="uc-text-link" href={createHref}>나만의 홈페이지 만들기</Link></div><p className="uc-hero-note"><Check size={15} />명함에도, 블로그에도, 이력서에도. 주소 하나면 돼요.</p></div>
      <div className="uc-hero-art"><img className="uc-hero-photo" src="/images/use-cases/business-card.webp" alt="고객에게 명함을 건네고 홈페이지로 더 많은 이야기를 이어가는 사용 장면" width={1440} height={960} fetchPriority="high" /><div className="uc-hero-photo-caption"><CreditCard size={19} /><span>만남은 짧아도,<br /><strong>내 이야기는 충분하게.</strong></span></div><button className="uc-floating-page" onClick={() => openDemo(USE_CASES[0])} aria-label="명함에서 이어지는 홈페이지 예시 열기"><span className="uc-floating-address"><Globe2 size={12} />온결 스튜디오의 홈페이지</span><img src="/images/interior-editorial.webp" alt="온결 스튜디오 예시 홈페이지에 담긴 밝은 거실" width={600} height={400} /><span className="uc-floating-copy"><strong>생활에 맞는,<br />편안한 공간.</strong><span>우리의 작업 둘러보기 <MousePointer2 size={14} /></span></span></button><span className="uc-hero-sticker"><Sparkles size={16} />내 이름으로 열리는 새로운 기회</span></div>
    </section>
    <div className="uc-sharing-line marketing-shell"><span>하나의 홈페이지, 다양한 시작점</span><div><span><CreditCard size={16} />명함</span><span><FileText size={16} />블로그</span><span><BriefcaseBusiness size={16} />이력서</span><span><Mail size={16} />제안 메일</span><span><MessageCircle size={16} />SNS 프로필</span></div></div>

    <section id="scenarios" className="uc-explorer"><div className="marketing-shell"><div className="uc-section-heading"><div><p className="uc-eyebrow">내 상황에 맞춰 상상해보세요</p><h2>당신의 홈페이지는,<br />어디에서 시작될까요?</h2></div><p>활용 장면을 고르고, 아래 과정을 눌러보세요.<br />첫 소개가 다음 대화로 이어지는 모습을 볼 수 있어요.</p></div>
      <div className="uc-case-tabs" role="tablist" aria-label="홈페이지 활용 사례">{USE_CASES.map((item, index) => { const Icon = CASE_ICONS[item.id]; return <button key={item.id} id={`case-tab-${item.id}`} role="tab" aria-selected={selected === item.id} aria-controls="case-panel" tabIndex={selected === item.id ? 0 : -1} onKeyDown={event => tabKey(event, index)} onClick={() => chooseCase(item.id)}><Icon size={18} /><span>{item.label}</span></button>; })}</div>
      <div id="case-panel" role="tabpanel" aria-labelledby={`case-tab-${selected}`} className="uc-case-panel" style={caseTheme(selectedCase)}>
        <div className="uc-case-story" key={selected}><span className="uc-case-audience">{selectedCase.audience}</span><h3>{selectedCase.title[0]}<br /><em>{selectedCase.title[1]}</em></h3><p>{selectedCase.description}</p><div className="uc-case-benefits">{selectedCase.benefits.map(([title, description]) => <div key={title}><Check size={17} /><div><h4>{title}</h4><p>{description}</p></div></div>)}</div><button className="uc-outline-button" onClick={() => openDemo(selectedCase)}><Layers3 size={17} />활용 장면 크게 보기</button><Link className="uc-real-example-link" href={`/examples/${EXAMPLE_SLUGS[selectedCase.id]}`}>완성된 홈페이지 예시 열기 ↗</Link></div>
        <div className="uc-case-experience"><div className="uc-experience-bar"><span><MousePointer2 size={14} />눌러보는 사용 장면</span><span aria-live="polite">{step + 1} / 3 · {selectedCase.steps[step]}</span></div><div className="uc-stage" key={`${selected}-${step}`}>
          {step === 0 ? <ShareScene item={selectedCase} onOpen={() => setStep(1)} /> : step === 1 ? <div className="uc-website-stage"><MiniWebsite item={selectedCase} onContact={() => setStep(2)} /><p>연락 버튼을 눌러 문의하는 장면도 확인해보세요.</p></div> : <InquiryDemo item={selectedCase} />}
        </div><div className="uc-journey" role="group" aria-label="활용 과정 선택">{selectedCase.steps.map((label, index) => <button key={label} aria-pressed={step === index} onClick={() => setStep(index)}><span>{index + 1}</span><strong>{label}</strong></button>)}</div></div>
      </div><p className="uc-example-note">가상 인물·업체로 구성한 활용 예시입니다. 실제 고객 사례나 성과가 아니며, 문의 체험은 전송되지 않아요.</p>
    </div></section>

    <section className="uc-more marketing-shell"><div className="uc-section-heading"><div><p className="uc-eyebrow">사업이 아니어도 괜찮아요</p><h2>내가 하고 싶은 일에도,<br />홈페이지가 어울려요.</h2></div><p>작업을 소개하고, 함께할 사람을 찾고,<br />누군가 찾아올 수 있는 공간을 만드는 일.</p></div><div className="uc-story-grid">{[USE_CASES[2], USE_CASES[4], USE_CASES[5]].map((item, index) => <button key={item.id} className="uc-story-card" onClick={() => chooseCase(item.id, true)}><div className="uc-story-image"><img src={item.image} alt={item.imageAlt} width={1440} height={960} loading="lazy" /><span>{["내 경험을 기회로", "좋아하는 일을 함께", "발견을 방문으로"][index]}</span></div><div><span>{item.audience}</span><h3>{["파일 하나보다, 나다운 소개.", "우리의 다음 모임, 여기에서.", "한 번 보고, 찾아오고 싶도록."][index]}</h3><p>{["이력서에 내 주소를 더해 경험과 작업의 맥락까지 보여주세요.", "공간과 수업을 사진으로 소개하고 함께할 사람들의 문의를 받아보세요.", "SNS에서 발견한 관심에 메뉴와 영업시간, 오시는 길로 답해보세요."][index]}</p><span className="uc-story-action">사용 장면 체험하기<MousePointer2 size={16} /></span></div></button>)}</div></section>

    <section id="make-it-yours" className="uc-personalize"><div className="marketing-shell uc-personalize-inner"><div className="uc-personalize-copy"><p className="uc-eyebrow"><Sparkles size={16} />이번엔, 내 이름으로</p><h2>여기에 내 이름이<br />들어간다면?</h2><p>버튼을 눌러 이름과 용도를 바꿔보세요.<br />나에게 어울리는 시작을 미리 만나볼 수 있어요.</p><button className="uc-outline-button uc-personal-open" onClick={() => { personalOpener.current = document.activeElement as HTMLElement; setPersonalOpen(true); }}><Pencil size={16} />내 이름으로 바꿔보기</button><Link className="uc-primary-link" href={createHref}>이제 내 홈페이지 만들기</Link><p className="uc-personal-note">화면 체험용 입력이며 저장되지 않아요.<br />실제 내용 작성은 홈페이지 만들기에서 시작해요.</p></div><div className="uc-personal-result" style={caseTheme(personalCase, personalColor)}><span className="uc-personal-result-label"><span />YOUR NEXT PAGE</span><MiniWebsite item={personalCase} name={personalName.trim() || undefined} onContact={() => openDemo({ ...personalCase, name: personalName.trim() || personalCase.name, color: personalColor })} /><p aria-live="polite">{personalName.trim() || personalCase.name}의 {personalCase.label} 예시</p></div></div></section>

    <section className="uc-perks marketing-shell"><div><Globe2 size={24} /><h3>어디서든, 같은 주소로.</h3><p>명함·블로그·SNS·이메일에<br />하나의 홈페이지를 연결하세요.</p></div><div><Layers3 size={24} /><h3>새 소식은, 같은 공간에.</h3><p>작업과 소개를 업데이트해도<br />공유한 주소는 계속 쓸 수 있어요.</p></div><div><MessageCircle size={24} /><h3>관심이 생긴 바로 그때.</h3><p>문의 양식이나 전화·카카오톡으로<br />대화를 시작할 수 있어요.</p></div></section>
    <section className="uc-ending"><div className="marketing-shell"><p>대단한 시작이 아니어도 괜찮아요.</p><h2>당신의 다음 기회가,<br />이 주소에서 시작되도록.</h2><Link className="uc-primary-link" href={createHref}>나만의 홈페이지 만들기</Link><span><Check size={15} />상단 · 중단 · 하단을 고르고, 내 이야기를 채우세요.</span></div></section>
  </main><CompanyFooter />
    <Dialog open={personalOpen} onOpenChange={setPersonalOpen}><DialogContent className="uc-personal-dialog" onCloseAutoFocus={event => { event.preventDefault(); personalOpener.current?.focus(); }}><DialogTitle>내 이름으로 그려보는 홈페이지</DialogTitle><DialogDescription>이름과 용도, 색상을 고르면 체험 화면이 바뀌어요. 실제로 저장되지는 않아요.</DialogDescription><div className="uc-personal-controls"><label htmlFor="use-case-name">이름 또는 브랜드</label><input id="use-case-name" value={personalName} onChange={event => setPersonalName(event.target.value)} maxLength={30} placeholder="예: 김하늘, 온결 스튜디오" /><label htmlFor="use-case-purpose">어떤 용도로 쓰고 싶나요?</label><select id="use-case-purpose" value={personalCaseId} onChange={event => { const item = USE_CASES.find(item => item.id === event.target.value)!; setPersonalCaseId(item.id); setPersonalColor(item.color); }}>{USE_CASES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}</select><div className="uc-personal-colors" role="group" aria-label="홈페이지 포인트 색상">{Object.values(COLORS).map(color => <button key={color.value} style={{ background: color.value }} aria-label={color.name} aria-pressed={personalColor === color.value} onClick={() => setPersonalColor(color.value)}>{personalColor === color.value && <Check size={16} />}</button>)}<span>내 분위기에 맞는 색상</span></div></div><button className="uc-primary-link" onClick={() => setPersonalOpen(false)}>바뀐 모습 보기</button></DialogContent></Dialog>
    <Dialog open={demo !== null} onOpenChange={open => { if (!open) setDemo(null); }}><DialogContent className="uc-example-dialog" onCloseAutoFocus={event => { event.preventDefault(); opener.current?.focus(); }}><div className="uc-example-dialog-heading"><span>사용예시 · 실제 고객 홈페이지가 아니에요</span><DialogTitle>{demo?.name}의 홈페이지</DialogTitle><DialogDescription>소개와 사진을 둘러보고 연락 버튼으로 문의 체험을 해보세요.</DialogDescription></div>{demo && <div className="uc-example-dialog-body" ref={demoBody} style={caseTheme(demo)}>{demoContact ? <><button className="uc-back-to-site" onClick={() => setDemoContact(false)}><X size={16} />홈페이지 예시로 돌아가기</button><InquiryDemo key={demo.id} item={demo} /></> : <MiniWebsite item={demo} expanded onContact={() => setDemoContact(true)} />}</div>}<div className="uc-example-dialog-footer"><span><ShieldCheck size={16} />문의는 실제 전송되지 않아요</span><Link className="uc-primary-link" href={createHref}>내 홈페이지 만들기</Link></div></DialogContent></Dialog>
  </div>;
}
