import type { SiteContent } from "./schema";

export function businessCopy(industry: SiteContent["industry"]) {
  if (industry === "이력서·포트폴리오") return {
    services: "경험과 역량", servicesTitle: "이런 일을 할 수 있어요", projects: "선택한 작업", about: "저를 소개합니다",
    contactTitle: "함께할 다음 이야기를\n기다립니다.", contactIntro: "채용 제안이나 협업에 대해 이야기하고 싶다면 아래에 메시지를 남겨주세요.", region: "활동 지역",
  };
  if (industry === "프리랜서·창작자") return {
    services: "함께할 작업", servicesTitle: "함께 만들 수 있는 것들", projects: "작업 모음", about: "작업하는 사람",
    contactTitle: "떠오른 아이디어가 있다면,\n함께 이야기해요.", contactIntro: "원하는 작업의 방향과 일정을 알려주세요. 확인 후 연락드릴게요.", region: "활동 지역",
  };
  if (industry === "전문가·상담") return {
    services: "상담 분야", servicesTitle: "어떤 도움이 필요하신가요?", projects: "공간과 이야기", about: "전문가 소개",
    contactTitle: "첫 상담의 시작,\n편하게 이야기해주세요.", contactIntro: "관심 있는 상담 분야와 연락 가능한 시간을 남겨주세요. 민감한 개인정보나 상세 자료는 첫 문의에 넣지 않으셔도 됩니다.", region: "상담 지역",
  };
  if (industry === "클래스·교육") return {
    services: "클래스 안내", servicesTitle: "새롭게 배워보는 즐거움", projects: "함께 만드는 순간", about: "클래스 소개",
    contactTitle: "새로운 취미의 시작,\n함께해볼까요?", contactIntro: "관심 있는 수업과 인원, 희망 날짜를 남겨주세요. 일정과 참여 방법은 상담 후 안내해드려요.", region: "진행 지역",
  };
  if (industry === "모임·커뮤니티" || industry === "행사·프로젝트") return {
    services: "활동 안내", servicesTitle: "함께하는 즐거움", projects: "활동 기록", about: "우리의 이야기",
    contactTitle: "같은 관심사로,\n함께 만나요.", contactIntro: "참여 방법이 궁금하거나 함께하고 싶은 일이 있다면 메시지를 남겨주세요.", region: "활동 지역",
  };
  if (industry === "카페") return {
    services: "메뉴", servicesTitle: "커피와 함께하는 시간", projects: "메뉴와 공간", about: "카페 소개",
    contactTitle: "방문 전 궁금한 점을\n편하게 물어보세요.", contactIntro: "메뉴와 영업시간, 단체 방문이 궁금하다면 문의를 남기거나 전화해주세요.", region: "매장 지역",
  };
  if (industry === "꽃집") return {
    services: "꽃과 서비스", servicesTitle: "마음을 전하는 꽃", projects: "꽃과 공간", about: "꽃집 소개",
    contactTitle: "소중한 날의 꽃을\n함께 준비해요.", contactIntro: "원하시는 꽃과 날짜, 예산을 알려주시면 상담에 도움이 됩니다.", region: "매장 지역",
  };
  if (industry === "이사·운송") return {
    services: "이사 서비스", servicesTitle: "이런 이사를 도와드려요", projects: "이사 현장", about: "업체 소개",
    contactTitle: "이사 견적을\n편하게 문의하세요.", contactIntro: "이사 날짜와 출발·도착 지역, 짐의 양을 알려주세요. 아래 양식으로 문의를 남기거나 전화로 상담할 수 있어요.", region: "활동 지역",
  };
  if (industry === "인테리어") return {
    services: "시공 서비스", servicesTitle: "이런 공간을 만듭니다", projects: "시공 사례", about: "업체 소개",
    contactTitle: "새롭게 바꾸고 싶은 공간,\n편하게 문의하세요.", contactIntro: "원하시는 작업과 지역을 알려주시면 상담에 도움이 됩니다.", region: "활동 지역",
  };
  return {
    services: "활동과 서비스", servicesTitle: "이런 일을 하고 있어요", projects: "사진과 이야기", about: "소개",
    contactTitle: "궁금한 점을\n편하게 이야기해주세요.", contactIntro: "관심 있는 활동이나 궁금한 점을 아래에 남겨주세요.", region: "활동 지역",
  };
}
