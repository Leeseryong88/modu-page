export const BRAND = {
  name: "모두의페이지",
  logoText: "모두의페이지",
  description: "나의 포트폴리오부터 전문 서비스, 클래스와 매장까지. 세 부분을 조립해 홈페이지를 만들고, 하나의 주소로 나를 알리고 연결되세요.",
  templateName: "상·중·하단 조립형",
};
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
export const COLORS = {
  navy: { name: "딥 네이비", value: "#233c52", soft: "#eef2f5" },
  green: { name: "포레스트 그린", value: "#285343", soft: "#eff4f1" },
  brown: { name: "웜 브라운", value: "#72503b", soft: "#f6f1ed" },
  terracotta: { name: "테라코타", value: "#a04732", soft: "#fbf0ec" },
  charcoal: { name: "차콜", value: "#333b3e", soft: "#f1f3f3" },
} as const;
