import Link from "next/link";
import { CreditCard, FileText, Sparkles } from "lucide-react";
import "./use-case-teaser.css";

export function UseCaseTeaser() {
  return <section className="use-case-teaser marketing-shell"><div><span><Sparkles size={16} />이렇게도 쓸 수 있어요</span><h2>내 홈페이지 하나로,<br />더 많은 가능성을.</h2><p>명함으로 시작하는 영업부터<br />전문가 상담, 이력서와 포트폴리오까지.<br />나에게 맞는 활용 장면을 직접 만나보세요.</p><Link href="/use-cases">사용예시 둘러보기</Link></div><Link className="use-case-teaser-images" href="/use-cases" aria-label="명함 영업과 포트폴리오 등 홈페이지 사용예시 보기"><figure><img src="/images/use-cases/business-card.webp" alt="고객에게 홈페이지 주소를 담은 명함을 건네는 모습" width={1440} height={960} loading="lazy" /><figcaption><CreditCard size={16} />명함 다음의 이야기</figcaption></figure><figure><img src="/images/use-cases/creative-work.webp" alt="개인의 경험과 작품을 보여줄 수 있는 디자이너의 작업물" width={1440} height={960} loading="lazy" /><figcaption><FileText size={16} />나를 담은 포트폴리오</figcaption></figure></Link></section>;
}
