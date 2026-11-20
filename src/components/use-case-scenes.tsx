"use client";
import { useState } from "react";
import { CheckCheck, Globe2, MessageCircle, MousePointer2, Send } from "lucide-react";
import type { UseCase } from "@/lib/use-cases";

export function ShareScene({ item, onOpen }: { item: UseCase; onOpen: () => void }) {
  return <div className="sx-share-scene">
    <img src={item.image} alt={item.imageAlt} width={1440} height={960} loading="lazy" />
    <div className="sx-share-card"><span>{item.channel}</span><h4>{item.shareTitle}</h4><p>{item.shareText}</p><button onClick={onOpen}><Globe2 size={17} /><span>{item.name}의 홈페이지</span><MousePointer2 size={16} /></button><small>소개 링크를 눌러 홈페이지 모습으로 이어가세요.</small></div>
  </div>;
}

export function InquiryDemo({ item }: { item: UseCase }) {
  const [sent, setSent] = useState(false);
  return <div className="sx-inquiry-demo">
    <span className="sx-demo-label">전송 없는 체험</span>
    {sent ? <div className="sx-inbox-result" role="status"><CheckCheck size={28} /><h4>문의함에서 이렇게 만나요.</h4><p>홈페이지를 보고 남긴 관심이<br />다음 대화의 시작이 됩니다.</p><div className="sx-inbox-card"><span>새 문의 · 예시</span><strong>{item.inquiryTitle}</strong><p>{item.inquiryMessage}</p><small>연락처 확인 · 상담 상태 · 나만 보는 메모</small></div><p className="sx-demo-safe">실제 문의는 전송되지 않았어요.</p><button className="sx-text-button" onClick={() => setSent(false)}>다시 체험하기</button></div>
      : <div className="sx-inquiry-sheet"><MessageCircle size={26} /><h4>관심이 다음 대화로.</h4><p>방문자는 홈페이지를 둘러보고<br />궁금한 내용을 남길 수 있어요.</p><div className="sx-inquiry-message"><span>문의 내용 · 예시</span><strong>{item.inquiryTitle}</strong><p>{item.inquiryMessage}</p></div><button className="sx-solid-button" onClick={() => setSent(true)}><Send size={16} />예시 문의 보내보기</button><small>개인정보 입력이나 실제 전송 없이 체험해요.</small></div>}
  </div>;
}
