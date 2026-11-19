import { EMPTY_CONTENT, type SiteContent, type SiteImage } from "./schema";

// Editorial demos only: never seeded into Firebase or used as customer records.
export type BusinessExample = {
  slug: string; category: string; purpose: string; summary: string; tone: string;
  hero: string; detail: string; content: SiteContent; imageSources: Record<string, string>;
};
type ExampleInput = Omit<BusinessExample, "content" | "imageSources"> & {
  name: string; industry: SiteContent["industry"]; region: string; tagline: string; about: string;
  color: SiteContent["color"]; hours: string;
  services: [string, string][]; photos: [string, string][];
};
function example(data: ExampleInput, index: number): BusinessExample {
  const id = (n: number) => `00000000-0000-4000-8000-${String(index * 10 + n).padStart(12, "0")}`;
  const photo = (n: number): SiteImage => ({ id: id(n), width: 1536, height: 1024 });
  return {
    slug: data.slug, category: data.category, purpose: data.purpose, summary: data.summary, tone: data.tone,
    hero: data.hero, detail: data.detail, imageSources: { [id(1)]: data.hero, [id(2)]: data.detail },
    content: {
      ...EMPTY_CONTENT, name: data.name, industry: data.industry, region: data.region, tagline: data.tagline,
      about: data.about, phone: "010-0000-0000", kakao: "https://pf.kakao.com/example", hours: data.hours,
      color: data.color, hero: photo(1),
      services: data.services.map(([title, description], i) => ({ id: id(i + 3), title, description })),
      projects: data.photos.map(([title, description], i) => ({ id: id(i + 6), title, description, image: photo(i === 0 ? 2 : 1) })),
    },
  };
}
export const EXAMPLES: BusinessExample[] = [
  example({
    slug: "cafe", category: "카페", name: "모로커피", industry: "카페", region: "서울 · 연남동", color: "brown", tone: "#73513e",
    purpose: "메뉴와 공간을 소개하고, 방문 문의 받기", summary: "시그니처 메뉴부터 영업시간까지, 방문하고 싶은 카페의 첫인상.",
    hero: "/images/examples/cafe.webp", detail: "/images/examples/cafe-detail.webp",
    tagline: "동네의 하루에, 커피 한 잔의 여유.", about: "창가에 앉아 잠시 쉬어가기 좋은 동네 카페, 모로커피입니다.\n취향에 맞는 커피와 매일 즐기기 좋은 베이커리를 준비합니다. 가볍게 들러 한 잔을 가져가셔도, 느긋하게 머무르셔도 좋아요.",
    hours: "매일 09:00–20:00", services: [["커피", "고소한 에스프레소부터 부드러운 플랫화이트까지. 취향에 맞는 한 잔을 골라보세요."], ["베이커리", "커피와 곁들이기 좋은 크루아상과 오늘의 구움과자를 준비합니다."], ["단체 주문", "여러 잔이 필요한 날에는 미리 연락해주세요. 수량과 준비 시간을 함께 확인해요."]],
    photos: [["플랫화이트와 크루아상", "부드러운 커피와 바삭한 한 입으로 시작하는 오후."], ["잠시 쉬어가는 창가", "햇살이 들어오는 작은 테이블에서 나만의 시간을 보내세요."]],
  }, 1),
  example({
    slug: "moving", category: "이사업체", name: "바른이사", industry: "이사·운송", region: "서울 · 경기", color: "navy", tone: "#233c52",
    purpose: "이사 서비스를 알리고, 견적 상담 받기", summary: "이사 종류와 작업 방식을 보여주고, 전화·카카오톡으로 견적 상담까지.",
    hero: "/images/examples/moving.webp", detail: "/images/examples/moving-detail.webp",
    tagline: "새로운 시작까지, 소중한 짐을 안전하게.", about: "짐의 양과 이동 동선부터 차근차근 확인합니다.\n가구와 생활용품을 특성에 맞게 포장하고, 도착지에서의 배치까지 함께 살펴봅니다. 일정과 작업 범위는 상담을 통해 안내드려요.",
    hours: "상담 09:00–18:00", services: [["가정 포장이사", "포장부터 운반, 정리까지. 집 구조와 짐의 양에 맞춰 필요한 작업을 상담합니다."], ["원룸·소형 이사", "혼자 옮기기 어려운 가구와 짐을 새 공간으로 옮겨드려요."], ["사무실 이전", "업무 일정에 맞춰 집기와 물품의 이동 계획을 함께 세웁니다."]],
    photos: [["가구를 위한 보호 포장", "운반 전에 모서리와 표면을 꼼꼼하게 보호합니다."], ["차근차근 싣고 안전하게 이동", "짐의 크기와 무게를 고려해 순서대로 작업합니다."]],
  }, 2),
  example({
    slug: "florist", category: "꽃집", name: "오후의 꽃", industry: "꽃집", region: "서울 · 망원동", color: "green", tone: "#285343",
    purpose: "꽃과 상품을 보여주고, 주문 상담 받기", summary: "계절의 꽃과 가게 분위기를 전하고, 특별한 날의 주문을 상담해요.",
    hero: "/images/examples/florist.webp", detail: "/images/examples/florist-detail.webp",
    tagline: "말로 다 못한 마음, 꽃으로 전해요.", about: "계절의 빛과 색을 담아 꽃을 준비하는 작은 꽃집입니다.\n누군가에게 건네는 선물도, 나를 위한 한 송이도 정성껏 골라드려요. 원하시는 분위기와 날짜를 알려주시면 함께 어울리는 꽃을 찾아봅니다.",
    hours: "화–일 11:00–19:00 · 월요일 휴무", services: [["계절 꽃다발", "그날의 신선한 꽃으로 계절감을 담아드립니다. 선호하는 색을 알려주세요."], ["꽃바구니", "축하와 감사의 마음을 풍성하게 담아요. 용도와 예산에 맞춰 상담합니다."], ["매장 꽃 장식", "공간의 분위기에 맞는 꽃과 크기를 함께 정합니다. 일정은 전화로 문의해주세요."]],
    photos: [["따뜻한 마음을 담은 꽃다발", "피치와 코럴 빛의 꽃, 가볍게 흔들리는 작은 들꽃."], ["꽃이 머무는 오후", "계절의 꽃과 초록으로 채워진 우리 동네의 작은 꽃집."]],
  }, 3),
  example({
    slug: "interior", category: "인테리어", name: "온결인테리어", industry: "인테리어", region: "수원 · 용인 · 화성", color: "charcoal", tone: "#333b3e",
    purpose: "시공 사례를 보여주고, 공사 문의 받기", summary: "사진으로 작업의 완성도를 전하고, 원하는 공간에 대한 상담으로 연결해요.",
    hero: "/images/interior-editorial.webp", detail: "/images/craft-materials.webp",
    tagline: "우리의 생활에 맞는, 편안한 공간.", about: "매일 사용하는 공간이 조금 더 편안해지도록 살핍니다.\n주거 공간의 부분 인테리어와 보수 작업을 진행하며, 현장 상태와 원하시는 방향을 확인한 뒤 작업 범위와 일정을 안내합니다.",
    hours: "평일 09:00–18:00 · 현장 방문 사전 상담", services: [["주거 공간 리모델링", "생활 방식과 동선에 맞춰 공간의 쓰임을 다시 생각합니다."], ["부분 인테리어", "주방, 욕실, 거실 등 필요한 공간부터 상담할 수 있어요."], ["마감과 보수", "현장 상태를 확인하고 적합한 자재와 작업 범위를 안내합니다."]],
    photos: [["공간에 어울리는 재료", "색과 질감이 서로 자연스럽게 어우러지는 마감을 찾습니다."], ["빛이 이어지는 거실", "유리 중문과 자연스러운 나무의 질감으로 정돈한 공간."]],
  }, 4),
];
export function getExample(slug: string) { return EXAMPLES.find(item => item.slug === slug); }
