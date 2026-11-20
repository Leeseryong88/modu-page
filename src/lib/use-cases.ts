export type UseCaseId = "business-card" | "professional" | "portfolio" | "freelance" | "class" | "local-shop";
export type UseCase = {
  id: UseCaseId; label: string; audience: string; title: [string, string]; description: string;
  benefits: [string, string][]; image: string; imageAlt: string; color: string; soft: string;
  name: string; role: string; tagline: string; about: string; offerings: string[];
  channel: string; shareTitle: string; shareText: string; steps: [string, string, string];
  inquiryTitle: string; inquiryMessage: string; inquiryLabel: string;
};

// Fictional scenarios explain existing sharing and inquiry features, not customer results.
export const USE_CASES: UseCase[] = [
  {
    id: "business-card", label: "명함·영업", audience: "소상공인 · 영업 · 1인 사업",
    title: ["명함 한 장을 건넨 뒤에도,", "내 일은 계속 소개되도록."],
    description: "짧은 만남에서 다 보여주지 못한 작업과 이야기를 홈페이지에 담아보세요. 명함에 적힌 주소가 다음 대화의 시작이 됩니다.",
    benefits: [["인사에서 신뢰로", "명함에는 주소 하나, 홈페이지에는 소개와 작업 사진을 충분히."], ["설명에서 상담으로", "고객이 사례를 살펴본 뒤 필요한 내용을 문의로 남길 수 있어요."]],
    image: "/images/use-cases/business-card.webp", imageAlt: "작업실에서 고객에게 명함을 건네며 자신의 일을 소개하는 모습",
    color: "#285343", soft: "#edf4ee", name: "온결 스튜디오", role: "공간을 만드는 사람들", tagline: "우리의 생활에 맞는, 편안한 공간.",
    about: "작은 공간의 변화부터 함께 생각합니다. 하는 일과 작업 과정을 살펴보고, 궁금한 점을 편하게 남겨주세요.", offerings: ["공간 소개", "최근 작업", "상담 문의"],
    channel: "BUSINESS CARD", shareTitle: "반갑습니다. 온결 스튜디오입니다.", shareText: "저희가 만든 공간은 이 주소에서 더 보실 수 있어요.", steps: ["명함에 주소 담기", "사진과 소개 둘러보기", "상담 문의 남기기"],
    inquiryTitle: "작은 매장 인테리어 상담", inquiryMessage: "명함을 보고 들어왔어요. 작업 사례와 비슷한 분위기의 공간을 만들고 싶습니다.", inquiryLabel: "상담 문의",
  },
  {
    id: "professional", label: "전문가 상담", audience: "변호사 · 세무사 · 독립 전문가",
    title: ["전문성은 차분하게 알리고,", "상담의 문턱은 낮추세요."],
    description: "변호사는 업무 분야와 상담 방법을, 세무사는 제공 서비스와 진행 절차를 정리해보세요. 개인 블로그의 글 끝에 홈페이지 주소를 더하면 관심이 상담으로 이어질 수 있어요.",
    benefits: [["블로그와 홈페이지를 함께", "블로그에는 생각과 정보를, 홈페이지에는 경력·업무 분야·연락 방법을 정리해요."], ["통화 전에도 문의 접수", "고객이 편한 시간에 내용을 남기고, 전문가는 별도 문의함에서 확인해요."]],
    image: "/images/use-cases/professional.webp", imageAlt: "밝은 사무실에서 고객의 이야기를 듣는 독립 전문가의 상담 장면",
    color: "#285343", soft: "#eef3f7", name: "서윤 세무사", role: "사업의 곁에서, 세무 상담", tagline: "복잡한 세무 이야기, 이해하기 쉽게.",
    about: "어떤 일을 돕는지, 상담은 어떻게 진행되는지 먼저 알아보세요. 상담을 원하시면 편한 시간에 문의를 남길 수 있어요.", offerings: ["업무 분야", "상담 절차", "상담 문의"],
    channel: "PERSONAL BLOG", shareTitle: "사업을 시작하며 챙겨볼 이야기", shareText: "글로 다 담지 못한 궁금증이 있다면, 제 홈페이지에서 업무 분야와 상담 방법을 확인해보세요.", steps: ["블로그에 소개 링크", "전문 분야 확인하기", "상담 내용 접수하기"],
    inquiryTitle: "사업 시작 전 세무 상담", inquiryMessage: "블로그 글을 읽고 문의드립니다. 처음 사업을 준비하고 있는데 상담 가능한 시간을 알고 싶어요.", inquiryLabel: "상담 문의",
  },
  {
    id: "portfolio", label: "포트폴리오", audience: "취업 준비 · 이직 · 디자이너 · 개발자",
    title: ["이력서에 다 담지 못한 나를,", "한 페이지로 펼쳐보세요."],
    description: "지원서나 이메일 서명에 내 주소를 더해보세요. 경험과 작업 과정, 완성한 결과물을 함께 보여주면 나를 이해할 단서가 더 많아집니다.",
    benefits: [["경험이 보이는 이력서", "직무 소개에 프로젝트 사진과 맡았던 역할을 더해 나만의 이야기를 만들어요."], ["새 작업도 같은 주소로", "새 프로젝트가 생기면 홈페이지를 업데이트하세요. 공유한 주소는 그대로 쓸 수 있어요."]],
    image: "/images/use-cases/creative-work.webp", imageAlt: "푸른색 아트 프린트와 종이 조형물로 채워진 디자이너의 작업 공간",
    color: "#233c52", soft: "#f1f0fb", name: "김하늘", role: "브랜드 디자이너 · 포트폴리오", tagline: "생각을, 기억에 남는 모습으로.",
    about: "브랜드의 이야기를 시각적으로 풀어내는 일을 합니다. 프로젝트마다 고민한 질문과 만들어낸 결과를 소개합니다.", offerings: ["자기소개", "프로젝트", "연락하기"],
    channel: "RESUME & EMAIL", shareTitle: "안녕하세요, 디자이너 김하늘입니다.", shareText: "저의 프로젝트와 작업 과정은 포트폴리오 홈페이지에서 자세히 보실 수 있습니다.", steps: ["이력서에 주소 더하기", "작업과 경험 살펴보기", "다음 기회로 연결하기"],
    inquiryTitle: "프로젝트 인터뷰 제안", inquiryMessage: "포트폴리오를 흥미롭게 보았습니다. 작업 과정에 대해 더 이야기 나눌 수 있을까요?", inquiryLabel: "연락 남기기",
  },
  {
    id: "freelance", label: "프리랜서", audience: "사진가 · 작가 · 디자이너 · 프리랜서",
    title: ["“어떤 작업을 하세요?”에", "주소 하나로 답하세요."],
    description: "메신저마다 파일을 따로 보내는 대신, 대표 작업과 제공 서비스를 한곳에 모아보세요. 소개받은 고객도 내 작업 스타일을 먼저 살펴볼 수 있어요.",
    benefits: [["작업과 의뢰 방법을 함께", "결과물만 보여주지 말고 작업 범위와 진행 방법도 알려주세요."], ["흩어진 연락의 출발점", "SNS 프로필과 제안 메일에 같은 주소를 넣고 협업 문의를 받아보세요."]],
    image: "/images/use-cases/photographer.webp", imageAlt: "카메라와 인화 사진, 작업 노트가 놓인 사진가의 책상",
    color: "#333b3e", soft: "#faf0e9", name: "온유 사진", role: "공간 · 브랜드 · 사진", tagline: "사람과 공간의 온도를, 사진에 담습니다.",
    about: "사람과 공간의 이야기를 자연스럽게 담습니다. 작업을 살펴보고 남기고 싶은 장면과 일정을 알려주세요.", offerings: ["공간 촬영", "최근 작업", "촬영 문의"],
    channel: "PROJECT PROPOSAL", shareTitle: "함께 만들어보고 싶은 일이 있어요.", shareText: "제 작업 스타일과 제공하는 서비스는 아래 홈페이지에 정리해두었습니다.", steps: ["제안 메일에 링크", "작업 스타일 확인", "협업 내용 남기기"],
    inquiryTitle: "새로운 공간의 촬영 의뢰", inquiryMessage: "소개받고 홈페이지를 둘러봤어요. 새 공간의 첫 사진을 함께 만들고 싶습니다.", inquiryLabel: "협업 문의",
  },
  {
    id: "class", label: "클래스·모임", audience: "공방 · 강사 · 원데이 클래스 · 소모임",
    title: ["함께할 사람을 찾는 일,", "소개 페이지부터 시작해요."],
    description: "무엇을 배우는지, 어디에서 만나는지, 어떤 준비가 필요한지 사진과 함께 알려주세요. 게시물에 홈페이지 주소를 더해 참여 문의를 받아볼 수 있어요.",
    benefits: [["반복되는 질문에 미리 답하기", "수업 내용·일정·장소를 한곳에 정리해 처음 오는 사람도 쉽게 이해하도록."], ["분위기가 전해지는 소개", "공간과 완성 작품을 보여주고, 참여 문의를 받은 뒤 일정을 직접 안내하세요."]],
    image: "/images/use-cases/workshop.webp", imageAlt: "함께 종이와 색을 고르며 창작을 즐기는 주말 클래스",
    color: "#a04732", soft: "#f8f2e8", name: "주말의 작업실", role: "일상에 더하는 작은 창작", tagline: "이번 주말엔, 손으로 만드는 시간.",
    about: "처음이어도 괜찮아요. 재료를 고르는 순간부터 완성까지 천천히 함께합니다. 수업 소개를 읽고 참여하고 싶은 날짜를 알려주세요.", offerings: ["클래스 소개", "작품 사진", "참여 문의"],
    channel: "SOCIAL POST", shareTitle: "나만의 것을 만드는 주말, 함께해요.", shareText: "수업 내용과 공간 사진은 홈페이지에서 만나보세요. 참여 문의도 남길 수 있어요.", steps: ["모집 글에 링크", "수업과 공간 살펴보기", "참여 일정 문의하기"],
    inquiryTitle: "주말 클래스 참여 문의", inquiryMessage: "친구와 함께 참여하고 싶어요. 초보자도 참여할 수 있는 일정이 있을까요?", inquiryLabel: "참여 문의",
  },
  {
    id: "local-shop", label: "우리 가게", audience: "카페 · 꽃집 · 동네 매장 · 작은 브랜드",
    title: ["SNS에서 발견한 가게를,", "방문하고 싶은 곳으로."],
    description: "예쁜 사진을 본 고객이 메뉴와 영업시간, 위치까지 한 번에 확인하도록 해보세요. 프로필의 링크 하나가 가게에 찾아오는 길을 안내합니다.",
    benefits: [["방문 전 궁금한 정보를 한곳에", "대표 메뉴, 매장 사진, 영업시간과 주소를 차분하게 보여주세요."], ["질문은 편한 방법으로", "단체 방문이나 상품에 관한 문의를 받고, 전화·카카오톡으로도 연결할 수 있어요."]],
    image: "/images/examples/cafe.webp", imageAlt: "햇살이 드는 창가와 따뜻한 목재 가구가 있는 작은 동네 카페",
    color: "#72503b", soft: "#f6f0eb", name: "모로커피", role: "서울 연남동의 작은 카페", tagline: "동네의 하루에, 커피 한 잔의 여유.",
    about: "커피 한 잔이 필요한 날에도, 잠시 쉬어가고 싶은 날에도 들러주세요. 메뉴와 공간, 방문에 필요한 정보를 담았습니다.", offerings: ["대표 메뉴", "공간 사진", "방문 안내"],
    channel: "SOCIAL PROFILE", shareTitle: "오늘의 여유를 만나는 곳, 모로커피.", shareText: "메뉴와 영업시간, 오시는 길은 프로필의 홈페이지 링크에서 확인하세요.", steps: ["SNS 프로필에 링크", "메뉴와 시간 확인", "방문 전 문의하기"],
    inquiryTitle: "주말 단체 방문 문의", inquiryMessage: "SNS에서 공간을 보고 문의드려요. 주말에 여러 명이 함께 방문해도 될까요?", inquiryLabel: "방문 문의",
  },
];
