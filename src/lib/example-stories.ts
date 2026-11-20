import type { BusinessExample } from "./examples";
import { USE_CASES, type UseCase, type UseCaseId } from "./use-cases";

const STORIES: Record<string, { id: UseCaseId; usage: string; shareTitle?: string; shareText?: string; inquiryTitle?: string; inquiryMessage?: string }> = {
  portfolio: { id: "portfolio", usage: "이력서와 이메일 서명에 주소를 넣어, 작업 과정까지 보여주세요." },
  photographer: { id: "freelance", usage: "SNS 프로필에서 촬영 포트폴리오와 의뢰 방법을 함께 안내해요." },
  professional: { id: "professional", usage: "블로그 글과 명함에서 전문 분야 소개와 상담 접수로 연결해요." },
  lawyer: { id: "professional", usage: "명함과 소개 글에 주소를 더해, 업무 분야와 상담 절차를 알려요.", shareTitle: "상담을 준비하는 분께", shareText: "업무 분야와 상담 진행 방법을 홈페이지에 정리했습니다. 일정이 궁금하다면 간단한 문의를 남겨주세요.", inquiryTitle: "계약 관련 상담 일정 문의", inquiryMessage: "소개 글을 보고 왔습니다. 계약에 관해 상담받고 싶은데 가능한 일정과 준비할 자료를 안내받을 수 있을까요?" },
  workshop: { id: "class", usage: "모집 게시물에 주소 하나를 더해, 작품과 수업 분위기를 전해요." },
  bookclub: { id: "class", usage: "모임 모집 글에서 분위기와 참여 방법을 안내하고 새 멤버를 만나요.", shareTitle: "함께 읽는 저녁, 한 자리를 준비했어요.", shareText: "어떤 모임인지, 어떻게 참여하는지 홈페이지에서 살펴보세요. 처음 오시는 분도 환영합니다.", inquiryTitle: "처음 참여하는 독서 모임 문의", inquiryMessage: "모집 글을 보고 들어왔어요. 평일 저녁에 처음 참여하고 싶은데 다음 선정 도서와 모임 일정을 알고 싶습니다." },
  cafe: { id: "local-shop", usage: "SNS 프로필에서 메뉴·영업시간·방문 문의까지 한 번에 안내해요." },
  moving: { id: "business-card", usage: "지역 커뮤니티와 명함에 작업 방식을 소개하고 견적 문의를 받아요.", shareTitle: "새로운 시작을 준비하고 계신가요?", shareText: "포장과 운반 방식, 상담 가능한 이사 종류를 홈페이지에서 확인해보세요.", inquiryTitle: "원룸 이사 일정과 견적 문의", inquiryMessage: "소개받고 홈페이지를 봤습니다. 다음 달 원룸 이사를 준비 중인데 일정과 견적 상담을 받을 수 있을까요?" },
  florist: { id: "local-shop", usage: "꽃 사진을 본 고객이 선물과 공간 장식을 편하게 문의하게 해요.", shareTitle: "이번 계절의 꽃을 만나보세요.", shareText: "꽃다발과 꽃바구니, 공간 장식은 홈페이지에서 둘러보세요. 원하시는 분위기와 날짜를 알려주세요.", inquiryTitle: "감사 선물용 꽃바구니 문의", inquiryMessage: "SNS에서 꽃 사진을 보고 왔어요. 다음 주에 선물할 꽃바구니를 준비하고 싶은데 주문 가능할까요?" },
  interior: { id: "business-card", usage: "명함을 건넨 뒤에도 시공 사진이 내 일을 소개하고 상담으로 이어져요." },
};

export function getExampleStory(example: BusinessExample): { usage: string; scene: UseCase } {
  const story = STORIES[example.slug];
  const base = USE_CASES.find(item => item.id === story.id)!;
  return { usage: story.usage, scene: { ...base, ...story, name: example.content.name, image: example.hero, imageAlt: `${example.content.name}의 활동과 공간`, color: example.tone } };
}
