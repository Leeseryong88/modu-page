export const BRAND = {
  name: "우리업체",
  logoText: "우리업체",
  description: "카페, 꽃집, 이사, 인테리어까지. 사진과 가게 정보로 홈페이지를 만들고, 내 주소로 공개해 전화·카카오톡 문의를 받으세요.",
  templateName: "기본 업체 소개형",
};
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const COLORS = {
  navy: { name: "딥 네이비", value: "#233c52", soft: "#eef2f5" },
  green: { name: "포레스트 그린", value: "#285343", soft: "#eff4f1" },
  brown: { name: "웜 브라운", value: "#72503b", soft: "#f6f1ed" },
  terracotta: { name: "테라코타", value: "#a04732", soft: "#fbf0ec" },
  charcoal: { name: "차콜", value: "#333b3e", soft: "#f1f3f3" },
} as const;
