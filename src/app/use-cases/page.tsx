import type { Metadata } from "next";
import { UseCasesPage } from "@/components/use-cases";

export const metadata: Metadata = {
  title: "사용예시 — 내 홈페이지로 시작하는 새로운 기회",
  description: "명함 영업, 변호사·세무사 상담, 이력서와 포트폴리오, 프리랜서 협업, 클래스 모집과 매장 안내. 나만의 홈페이지를 활용하는 여섯 가지 장면을 직접 체험해보세요.",
  alternates: { canonical: "/use-cases" },
  openGraph: { title: "나를 알리는, 조금 더 멋진 방법", description: "나만의 홈페이지를 활용하는 여섯 가지 장면을 만나보세요.", url: "/use-cases", images: [{ url: "/images/use-cases/business-card.webp", width: 1440, height: 960, alt: "명함에서 홈페이지로 이어지는 새로운 만남" }] },
};
export default function Page() { return <UseCasesPage />; }
