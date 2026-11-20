import { EMPTY_CONTENT, type SiteContent, type SiteImage } from "./schema";

// Editorial demos only: never seeded into Firebase or used as customer records.
export type BusinessExample = {
  audience: "개인·창작자" | "전문가" | "클래스·모임" | "매장·비즈니스";
  slug: string; category: string; purpose: string; summary: string; tone: string;
  hero: string; detail: string; content: SiteContent; imageSources: Record<string, string>;
};
type ExampleInput = Omit<BusinessExample, "content" | "imageSources" | "detail"> & {
  name: string; industry: SiteContent["industry"]; region: string; tagline: string; about: string;
  color: SiteContent["color"]; hours: string; layout: SiteContent["layout"]; phone?: string;
  services: [string, string][]; photos: [title: string, description: string, image: string][];
};
function example(data: ExampleInput, index: number): BusinessExample {
  const id = (n: number) => `00000000-0000-4000-8000-${String(index * 100 + n).padStart(12, "0")}`;
  const photo = (n: number): SiteImage => ({ id: id(n), width: 1536, height: 1024 });
  return {
    audience: data.audience, slug: data.slug, category: data.category, purpose: data.purpose, summary: data.summary, tone: data.tone,
    hero: data.hero, detail: data.photos[0][2], imageSources: { [id(1)]: data.hero, ...Object.fromEntries(data.photos.map((photo, i) => [id(20 + i), photo[2]])) },
    content: {
      ...EMPTY_CONTENT, name: data.name, industry: data.industry, region: data.region, tagline: data.tagline,
      about: data.about, phone: data.phone ?? "010-0000-0000", kakao: data.audience === "매장·비즈니스" ? "https://pf.kakao.com/example" : "", hours: data.hours,
      color: data.color, hero: photo(1),
      layout: data.layout,
      services: data.services.map(([title, description], i) => ({ id: id(i + 3), title, description })),
      projects: data.photos.map(([title, description], i) => ({ id: id(i + 6), title, description, image: photo(20 + i) })),
    },
  };
}
export const EXAMPLES: BusinessExample[] = [
  example({
    slug: "portfolio", audience: "개인·창작자", category: "이력서·포트폴리오", name: "김하늘", industry: "이력서·포트폴리오", region: "", color: "navy", tone: "#233c52", phone: "",
    layout: { top: "editorial", middle: "gallery", bottom: "compact" },
    purpose: "나의 경험과 작업을 한곳에, 채용과 협업으로 연결", summary: "자기소개부터 선택한 작업과 역량까지. 이력서에 담을 나만의 한 페이지.",
    hero: "/images/use-cases/creative-work.webp",
    tagline: "일상의 작은 발견을, 기억에 남는 디자인으로.", about: "안녕하세요. 시각 언어로 이야기를 전하는 디자이너 김하늘입니다.\n복잡한 정보를 정리하고, 브랜드의 성격이 느껴지는 이미지와 인쇄물을 만듭니다. 관찰과 기록으로 시작해 오래 쓰이는 디자인을 고민합니다.",
    hours: "협업·채용 제안은 아래 문의로 남겨주세요.", services: [["브랜드 아이덴티티", "작은 브랜드의 방향을 정리하고 로고, 색상, 그래픽으로 연결합니다."], ["편집 디자인", "읽는 순서를 고려해 책과 인쇄물을 구성합니다. 정보가 편하게 전해지는 리듬을 찾습니다."], ["함께 일하는 방식", "리서치, 시안, 피드백을 차근차근 공유하며 팀의 언어를 시각적으로 정리합니다."]],
    photos: [["작은 브랜드의 첫 얼굴","역할 · 브랜드 방향 정리, 패키지와 인쇄물 디자인. 코발트 블루와 단순한 도형으로 여러 매체에서 이어지는 시각 언어를 만들었습니다.","/images/examples-expanded/portfolio-brand.webp"],["읽는 리듬을 만드는 책","역할 · 편집 구성과 지면 디자인. 사진과 여백의 비율을 조절해 천천히 읽고 오래 펼쳐보고 싶은 아트북을 구성했습니다.","/images/examples-expanded/portfolio-book.webp"],["종이 위의 형태 실험","개인 작업 · 색과 도형, 종이의 질감을 관찰한 포스터 시리즈. 작은 조합을 반복하며 서로 다른 분위기를 탐색합니다.","/images/examples-expanded/portfolio-prints.webp"]],
  }, 5),
  example({
    slug: "professional", audience: "전문가", category: "전문가·상담", name: "서윤 세무사", industry: "전문가·상담", region: "서울 · 온라인 상담", color: "green", tone: "#285343",
    layout: { top: "split", middle: "list", bottom: "classic" },
    purpose: "전문 분야를 소개하고, 첫 상담 문의 받기", summary: "블로그와 명함의 링크를 전문 소개와 상담 문의로 이어보세요.",
    hero: "/images/use-cases/professional.webp",
    tagline: "어려운 세금 이야기, 이해할 수 있는 말로.", about: "일의 흐름을 이해하고, 질문을 충분히 듣는 것부터 시작합니다.\n처음 사업을 시작할 때의 궁금증부터 일상적인 세무 관리까지, 상황을 함께 정리하며 필요한 상담 방향을 안내합니다. 상담 일정과 진행 범위는 문의 후 협의합니다.",
    hours: "평일 10:00–18:00 · 사전 일정 협의", services: [["첫 사업 상담", "사업을 준비하며 궁금한 점과 현재 상황을 함께 정리합니다."], ["사업자 세무 관리", "업무와 일정에 맞춰 필요한 세무 관리 범위를 상담합니다."], ["개인 세무 상담", "개별 상황에 대한 상담 가능 여부와 준비할 자료를 안내합니다."]],
    photos: [["차근차근 준비하는 상담","현재 상황과 궁금한 점부터 정리합니다. 첫 상담에 필요한 자료와 진행 방법은 일정 협의 후 안내합니다.","/images/examples-expanded/tax-desk.webp"],["이야기를 듣는 공간","편안한 자리에서 질문을 충분히 나누고, 이해하기 쉬운 말로 다음 단계를 함께 살펴봅니다.","/images/examples-expanded/tax-room.webp"],["소개에서 연결로","명함과 블로그에 홈페이지 주소를 담습니다. 전문 분야를 먼저 확인하고 편한 시간에 문의를 남길 수 있습니다.","/images/use-cases/business-card.webp"]],
  }, 6),
  example({
    slug: "workshop", audience: "클래스·모임", category: "클래스·교육", name: "주말의 작업실", industry: "클래스·교육", region: "서울 · 성수", color: "terracotta", tone: "#a04732", phone: "",
    layout: { top: "cover", middle: "story", bottom: "card" },
    purpose: "수업의 분위기를 보여주고, 참여 문의 받기", summary: "사진 속 즐거움이 참여로 이어지도록. 수업과 일정 안내를 한 페이지에.",
    hero: "/images/use-cases/workshop.webp",
    tagline: "손으로 만드는 시간, 나에게 주는 작은 주말.", about: "처음이어도 괜찮은 작은 종이 공방입니다.\n색을 고르고, 종이를 자르고, 나만의 구성을 만들어봅니다. 완벽한 결과보다 직접 발견하는 즐거움을 함께 나누고 싶어요. 혼자 와도, 친구와 함께 와도 편안한 시간을 준비합니다.",
    hours: "주말 수업 · 날짜와 잔여 자리는 문의해주세요.", services: [["종이 콜라주 클래스", "다양한 색과 질감의 종이로 나만의 작은 작품을 만듭니다. 필요한 재료는 준비해드려요."], ["나만의 아트 카드", "소중한 사람에게 전할 카드를 직접 구성해요. 처음 오신 분도 참여할 수 있습니다."], ["함께하는 소규모 모임", "친구, 동료와 함께 만드는 시간을 기획해요. 인원과 일정은 별도 문의해주세요."]],
    photos: [["내가 만든 작은 아트 카드","종이를 고르고 오려 붙여 한 장의 이야기를 완성합니다. 수업에서 만든 카드는 가져갈 수 있어요.","/images/examples-expanded/workshop-cards.webp"],["도구와 친해지는 시간","작은 롤러로 색을 올리고 질감을 살펴봅니다. 처음 다루는 도구도 천천히 함께 익혀요.","/images/examples-expanded/workshop-tools.webp"],["서로 다른 결과가 모이는 곳","완성한 작업을 함께 감상하며 발견한 점을 나눕니다. 잘 만드는 것보다 자기만의 표현을 찾는 시간입니다.","/images/examples-expanded/workshop-display.webp"]],
  }, 7),
  example({
    slug: "photographer", audience: "개인·창작자", category: "프리랜서·창작자", name: "온유 사진", industry: "프리랜서·창작자", region: "서울 · 전국 협의", color: "charcoal", tone: "#333b3e", phone: "",
    layout: { top: "centered", middle: "gallery", bottom: "banner" },
    purpose: "작업의 분위기를 전하고, 촬영 의뢰 받기", summary: "SNS에서 발견한 사진을 더 깊이 살펴보고 촬영 문의까지 이어지게 해요.",
    hero: "/images/use-cases/photographer.webp",
    tagline: "사람과 공간의 온도를, 사진에 담습니다.", about: "시간이 지나도 그날의 분위기가 떠오르는 사진을 좋아합니다.\n브랜드와 공간, 일상의 순간을 촬영합니다. 어떤 이야기를 남기고 싶은지 먼저 듣고, 장소와 빛에 어울리는 방법을 함께 찾아갑니다.",
    hours: "촬영 일정은 문의 후 협의합니다.", services: [["공간 촬영", "빛과 동선, 공간을 채우는 디테일을 담아요. 매장과 숙소, 작업실 촬영을 상담합니다."], ["브랜드 이미지", "제품과 브랜드의 분위기를 전하는 사진을 함께 기획합니다."], ["일상 기록", "오래 기억하고 싶은 장면을 자연스럽게 남깁니다. 일정과 장소를 알려주세요."]],
    photos: [["만드는 사람의 초상","작업자와 공간의 관계를 기록한 인물 촬영. 익숙한 자리에서 자연스러운 표정과 손의 움직임을 기다립니다.","/images/examples-expanded/photo-portrait.webp"],["빛과 구조 사이","공간 촬영 · 빛이 바뀌는 시간에 맞춰 건축의 선과 재료를 담습니다. 공간의 깊이가 느껴지는 장면을 찾습니다.","/images/examples-expanded/photo-architecture.webp"],["작은 물건의 분위기","제품 촬영 · 유리와 돌, 빛의 관계를 살피며 제품의 성격을 드러냅니다. 기획부터 촬영 방향까지 함께 정합니다.","/images/examples-expanded/photo-product.webp"]],
  }, 8),
  example({
    slug: "lawyer", audience: "전문가", category: "변호사·법률 상담", name: "이도현 변호사", industry: "전문가·상담", region: "서울 · 사전 예약 상담", color: "navy", tone: "#233c52",
    layout: { top: "editorial", middle: "story", bottom: "card" },
    purpose: "업무 분야와 상담 절차를 안내하고, 상담 일정 문의 받기", summary: "전문 분야부터 상담 준비까지 차분하게. 명함과 블로그를 첫 상담으로 연결해요.",
    hero: "/images/examples-expanded/lawyer-hero.webp",
    tagline: "복잡한 상황일수록, 충분히 듣는 것부터.", about: "일상과 사업에서 생긴 고민을 차분하게 정리하는 상담을 지향합니다.\n어떤 일이 있었는지 듣고, 관련 자료와 확인할 점을 함께 살펴봅니다. 진행 가능한 업무 범위와 상담 일정은 문의 후 개별적으로 안내합니다.\n아래 업무 분야는 소개를 위한 예시이며, 구체적인 판단은 개별 상담을 통해 이루어집니다.",
    hours: "평일 10:00–18:00 · 방문 전 일정 예약", services: [["일상의 계약과 분쟁", "계약 내용과 분쟁의 경위를 먼저 확인합니다. 상담에 필요한 자료는 일정 협의 후 안내합니다."], ["사업자를 위한 법률 상담", "사업을 운영하며 발생하는 계약과 거래 관련 질문을 함께 정리합니다. 업무 가능 범위는 사전 문의해주세요."], ["상담 준비와 진행 안내", "문의 접수 → 일정과 범위 협의 → 자료 확인 → 개별 상담 순서로 진행합니다. 최초 문의에는 간단한 상황만 남겨주세요."]],
    photos: [["충분히 듣는 첫 만남", "편안한 자리에서 상황을 이해하고 질문을 정리합니다. 예약한 시간에 차분하게 이야기할 수 있도록 준비합니다.", "/images/examples-expanded/lawyer-consultation.webp"], ["자료를 살피는 시간", "관련 문서와 사실관계를 하나씩 확인합니다. 상담 전 필요한 자료의 종류를 안내받으실 수 있습니다.", "/images/examples-expanded/lawyer-documents.webp"], ["차분하게 이야기하는 공간", "조용한 상담 공간에서 대화에 집중합니다. 방문 상담은 미리 일정을 협의해주세요.", "/images/examples-expanded/lawyer-library.webp"]],
  }, 9),
  example({
    slug: "bookclub", audience: "클래스·모임", category: "독서 모임·커뮤니티", name: "사이의 서재", industry: "모임·커뮤니티", region: "서울 · 망원동", color: "green", tone: "#285343", phone: "",
    layout: { top: "centered", middle: "gallery", bottom: "banner" },
    purpose: "모임의 분위기와 참여 방법을 소개하고, 새로운 멤버 만나기", summary: "책으로 시작해 사람으로 이어지는 모임. 모집 글의 링크에서 분위기와 참여 방법을 확인해요.",
    hero: "/images/examples-expanded/bookclub-hero.webp",
    tagline: "같은 책, 서로 다른 이야기. 함께 읽는 저녁.", about: "혼자 읽을 때 지나쳤던 문장을 다른 사람의 이야기 속에서 다시 만납니다.\n사이의 서재는 책 한 권을 매개로 생각을 나누는 작은 독서 모임입니다. 책을 완벽히 이해하거나 멋진 감상을 준비할 필요는 없어요. 마음에 남은 문장 하나만 가져오세요.\n진행자가 대화를 돕고, 서로의 말에 귀 기울이는 시간을 만듭니다. 처음 참여하시는 분도 환영합니다.",
    hours: "평일 저녁·주말 모임 · 일정은 문의 후 안내", services: [["함께 읽는 한 권", "한 달에 한 권을 천천히 읽고 모입니다. 선정 도서와 다음 모임 일정은 참여 문의 시 안내해요."], ["처음 오는 분을 위한 안내", "모임은 4–6명의 소규모로 진행합니다. 좋아하는 장르와 참여 가능한 시간을 알려주시면 모임을 소개해드려요."], ["기록하고 나누는 시간", "인상 깊은 문장을 적고, 다른 사람의 해석을 들어봅니다. 발표나 평가보다 편안한 대화를 소중히 여깁니다."]],
    photos: [["책과 차가 놓인 자리", "한 문장과 작은 메모에서 대화를 시작합니다. 생각이 정리되지 않아도 함께 이야기하며 발견할 수 있어요.", "/images/examples-expanded/bookclub-table.webp"], ["취향이 머무는 책장", "다양한 분야의 책 사이에서 다음 이야기를 찾습니다. 참여자의 추천도 반갑게 나눠요.", "/images/examples-expanded/bookclub-shelves.webp"], ["당신을 기다리는 한 자리", "다음 모임을 준비한 조용한 공간. 참여 방법과 일정이 궁금하다면 아래에 편하게 남겨주세요.", "/images/examples-expanded/bookclub-meeting.webp"]],
  }, 10),
  example({
    slug: "cafe", audience: "매장·비즈니스", layout: { top: "centered", middle: "cards", bottom: "card" }, category: "카페", name: "모로커피", industry: "카페", region: "서울 · 연남동", color: "brown", tone: "#73513e",
    purpose: "메뉴와 공간을 소개하고, 방문 문의 받기", summary: "시그니처 메뉴부터 영업시간까지, 방문하고 싶은 카페의 첫인상.",
    hero: "/images/examples/cafe.webp",
    tagline: "동네의 하루에, 커피 한 잔의 여유.", about: "창가에 앉아 잠시 쉬어가기 좋은 동네 카페, 모로커피입니다.\n취향에 맞는 커피와 매일 즐기기 좋은 베이커리를 준비합니다. 가볍게 들러 한 잔을 가져가셔도, 느긋하게 머무르셔도 좋아요.",
    hours: "매일 09:00–20:00", services: [["커피", "고소한 에스프레소부터 부드러운 플랫화이트까지. 취향에 맞는 한 잔을 골라보세요."], ["베이커리", "커피와 곁들이기 좋은 크루아상과 오늘의 구움과자를 준비합니다."], ["단체 주문", "여러 잔이 필요한 날에는 미리 연락해주세요. 수량과 준비 시간을 함께 확인해요."]],
    photos: [["플랫화이트와 크루아상","부드러운 커피와 바삭한 한 입으로 시작하는 오후. 대표 메뉴는 매장에서 편하게 물어봐 주세요.","/images/examples/cafe-detail.webp"],["매일의 작은 구움과자","레몬 케이크와 스콘, 마들렌을 커피와 함께 즐겨보세요. 당일 준비된 종류는 조금씩 달라집니다.","/images/examples-expanded/cafe-bakery.webp"],["한 잔에 담는 정성","주문한 순간부터 한 잔을 완성하기까지. 우유의 온도와 질감을 살피며 천천히 준비합니다.","/images/examples-expanded/cafe-bar.webp"]],
  }, 1),
  example({
    slug: "moving", audience: "매장·비즈니스", layout: { top: "split", middle: "list", bottom: "banner" }, category: "이사업체", name: "바른이사", industry: "이사·운송", region: "서울 · 경기", color: "navy", tone: "#233c52",
    purpose: "이사 서비스를 알리고, 견적 상담 받기", summary: "이사 종류와 작업 방식을 보여주고, 전화·카카오톡으로 견적 상담까지.",
    hero: "/images/examples/moving.webp",
    tagline: "새로운 시작까지, 소중한 짐을 안전하게.", about: "짐의 양과 이동 동선부터 차근차근 확인합니다.\n가구와 생활용품을 특성에 맞게 포장하고, 도착지에서의 배치까지 함께 살펴봅니다. 일정과 작업 범위는 상담을 통해 안내드려요.",
    hours: "상담 09:00–18:00", services: [["가정 포장이사", "포장부터 운반, 정리까지. 집 구조와 짐의 양에 맞춰 필요한 작업을 상담합니다."], ["원룸·소형 이사", "혼자 옮기기 어려운 가구와 짐을 새 공간으로 옮겨드려요."], ["사무실 이전", "업무 일정에 맞춰 집기와 물품의 이동 계획을 함께 세웁니다."]],
    photos: [["가구를 위한 보호 포장","운반 전에 가구의 모서리와 표면을 확인하고, 크기와 소재에 맞는 보호재를 사용합니다.","/images/examples/moving-detail.webp"],["움직임까지 생각한 적재","짐의 크기와 무게에 맞춰 배치하고 고정합니다. 이동 중 흔들림을 줄일 수 있도록 순서를 살펴요.","/images/examples-expanded/moving-truck.webp"],["새 공간에서의 마무리","도착 후 배치할 위치를 확인하고 필요한 가구를 정리합니다. 이사 범위와 현장 조건은 사전에 상담합니다.","/images/examples-expanded/moving-finished.webp"]],
  }, 2),
  example({
    slug: "florist", audience: "매장·비즈니스", layout: { top: "cover", middle: "gallery", bottom: "compact" }, category: "꽃집", name: "오후의 꽃", industry: "꽃집", region: "서울 · 망원동", color: "green", tone: "#285343",
    purpose: "꽃과 상품을 보여주고, 주문 상담 받기", summary: "계절의 꽃과 가게 분위기를 전하고, 특별한 날의 주문을 상담해요.",
    hero: "/images/examples/florist.webp",
    tagline: "말로 다 못한 마음, 꽃으로 전해요.", about: "계절의 빛과 색을 담아 꽃을 준비하는 작은 꽃집입니다.\n누군가에게 건네는 선물도, 나를 위한 한 송이도 정성껏 골라드려요. 원하시는 분위기와 날짜를 알려주시면 함께 어울리는 꽃을 찾아봅니다.",
    hours: "화–일 11:00–19:00 · 월요일 휴무", services: [["계절 꽃다발", "그날의 신선한 꽃으로 계절감을 담아드립니다. 선호하는 색을 알려주세요."], ["꽃바구니", "축하와 감사의 마음을 풍성하게 담아요. 용도와 예산에 맞춰 상담합니다."], ["매장 꽃 장식", "공간의 분위기에 맞는 꽃과 크기를 함께 정합니다. 일정은 전화로 문의해주세요."]],
    photos: [["따뜻한 마음을 담은 꽃다발","피치와 코럴 빛의 꽃에 작은 들꽃을 더했어요. 선물하는 마음과 좋아하는 색을 알려주세요.","/images/examples/florist-detail.webp"],["감사의 마음을 담은 바구니","은은한 아이보리와 라벤더 컬러를 풍성하게 엮었습니다. 계절과 입고 상황에 맞춰 어울리는 꽃을 골라요.","/images/examples-expanded/florist-basket.webp"],["공간을 반기는 꽃","매장의 입구와 작은 행사에 어울리는 꽃 장식. 장소의 크기와 분위기, 필요한 날짜를 먼저 나눕니다.","/images/examples-expanded/florist-installation.webp"]],
  }, 3),
  example({
    slug: "interior", audience: "매장·비즈니스", layout: { top: "editorial", middle: "story", bottom: "classic" }, category: "인테리어", name: "온결인테리어", industry: "인테리어", region: "수원 · 용인 · 화성", color: "charcoal", tone: "#333b3e",
    purpose: "시공 사례를 보여주고, 공사 문의 받기", summary: "사진으로 작업의 완성도를 전하고, 원하는 공간에 대한 상담으로 연결해요.",
    hero: "/images/interior-editorial.webp",
    tagline: "우리의 생활에 맞는, 편안한 공간.", about: "매일 사용하는 공간이 조금 더 편안해지도록 살핍니다.\n주거 공간의 부분 인테리어와 보수 작업을 진행하며, 현장 상태와 원하시는 방향을 확인한 뒤 작업 범위와 일정을 안내합니다.",
    hours: "평일 09:00–18:00 · 현장 방문 사전 상담", services: [["주거 공간 리모델링", "생활 방식과 동선에 맞춰 공간의 쓰임을 다시 생각합니다."], ["부분 인테리어", "주방, 욕실, 거실 등 필요한 공간부터 상담할 수 있어요."], ["마감과 보수", "현장 상태를 확인하고 적합한 자재와 작업 범위를 안내합니다."]],
    photos: [["재료에서 시작하는 분위기","실제 생활에서 마주할 색과 질감, 관리 방법을 함께 살펴봅니다. 사진과 다른 실제 재료의 느낌도 확인해요.","/images/craft-materials.webp"],["머무르기 좋은 주방","따뜻한 나무와 밝은 마감으로 정리한 주방 제안. 수납과 작업 동선을 함께 생각한 공간입니다.","/images/examples-expanded/interior-kitchen.webp"],["일상을 편안하게 하는 욕실","차분한 타일과 간결한 수납으로 구성한 욕실 제안. 현장 조건에 맞는 자재와 작업 범위를 상담합니다.","/images/examples-expanded/interior-bathroom.webp"]],
  }, 4),
];
export function getExample(slug: string) { return EXAMPLES.find(item => item.slug === slug); }
