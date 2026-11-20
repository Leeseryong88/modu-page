export const DEFAULT_LAYOUT = { top: "split", middle: "cards", bottom: "classic" } as const;
export type SiteSection = "top" | "middle" | "bottom";
export const SECTION_INFO = {
  top: { label: "상단", title: "첫인상 만들기", description: "이름, 한 줄 소개와 대표 사진으로 시작해요.", contents: "이름과 소개 · 대표 사진" },
  middle: { label: "중단", title: "내 이야기 보여주기", description: "소개, 서비스와 사진을 필요한 만큼 채워보세요.", contents: "소개 · 서비스 · 사진" },
  bottom: { label: "하단", title: "방문자와 연결하기", description: "연락 방법과 안내 정보를 넣고 문의받는 방법을 정해요.", contents: "연락처 · 활동 시간 · 문의" },
} as const;
export const SECTION_TEMPLATES = {
  top: [
    { id: "split", name: "균형 있는 소개", description: "글과 사진을 나란히", tag: "다양한 소개에" },
    { id: "centered", name: "시원한 첫인상", description: "중앙 소개 아래 넓은 사진", tag: "포트폴리오 · 공간" },
    { id: "cover", name: "사진 한 장의 힘", description: "큰 사진 위에 선명한 소개", tag: "꽃집 · 브랜드" },
    { id: "editorial", name: "감각적인 매거진", description: "사진을 먼저, 이야기를 옆에", tag: "창작자 · 스튜디오" },
  ],
  middle: [
    { id: "cards", name: "한눈에 카드", description: "소개와 서비스를 카드로", tag: "메뉴 · 서비스" },
    { id: "gallery", name: "사진 갤러리", description: "사진을 맨 앞에 크게", tag: "상품 · 포트폴리오" },
    { id: "story", name: "이야기가 있는 공간", description: "소개와 사례를 차례로", tag: "브랜드 · 작업 과정" },
    { id: "list", name: "깔끔한 목록", description: "서비스를 읽기 좋은 목록으로", tag: "이력 · 전문 분야" },
  ],
  bottom: [
    { id: "classic", name: "친절한 안내", description: "이름과 소개와 상담을 나란히", tag: "기본 안내" },
    { id: "compact", name: "간결한 마무리", description: "연락 정보를 모아 깔끔하게", tag: "빠른 연락" },
    { id: "card", name: "방문 안내 카드", description: "주소와 시간을 독립된 카드로", tag: "매장 방문" },
    { id: "banner", name: "눈에 띄는 문의", description: "브랜드 색상으로 연락처 강조", tag: "상담 · 예약" },
  ],
} as const;
export function sectionForField(path: string): SiteSection {
  if (/^(about|services|projects)(\.|$)/.test(path) || path === "layout.middle") return "middle";
  if (/^(phone|kakao|address|hours|links|inquiryEnabled)(\.|$)/.test(path) || path === "layout.bottom") return "bottom";
  return "top";
}
