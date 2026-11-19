import type { SiteContent } from "./schema";

export function businessCopy(industry: SiteContent["industry"]) {
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
    services: "서비스", servicesTitle: "이런 서비스를 제공합니다", projects: "사진과 사례", about: "업체 소개",
    contactTitle: "궁금한 점을\n편하게 문의하세요.", contactIntro: "필요한 서비스와 궁금한 점을 알려주시면 상담에 도움이 됩니다.", region: "활동 지역",
  };
}
