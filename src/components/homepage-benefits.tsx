import { Check, Globe2, QrCode } from "lucide-react";
import { getExample, type BusinessExample } from "@/lib/examples";
import styles from "./homepage-benefits.module.css";

export function HomepageBenefits({ onPreview }: { onPreview: (example: BusinessExample) => void }) {
  const interior = getExample("interior")!;

  return (
    <section id="benefits" className={styles.section} aria-labelledby="benefits-heading">
      <div className="marketing-shell">
        <div className={styles.heading}>
          <div>
            <p className="section-label">홈페이지가 생기면, 달라지는 일들</p>
            <h2 id="benefits-heading">나만의 홈페이지로<br />할 수 있는 일.</h2>
          </div>
          <p>명함 한 장에서 시작된 관심이,<br />내 작업을 보고 문의하는 순간까지 이어져요.</p>
        </div>

        <div className={styles.grid}>
          <article className={styles.benefit}>
            <div className={`${styles.scene} ${styles.shareScene}`} role="img" aria-label="명함을 건네는 사진과 홈페이지 주소·QR 코드가 담긴 명함의 활용 예시">
              <img className={styles.sharePhoto} src="/images/use-cases/business-card.webp" alt="" width={1440} height={960} loading="lazy" />
              <span className={styles.sceneTag}><QrCode size={16} />명함에서 홈페이지로</span>
              <div className={styles.businessCard}>
                <div className={styles.cardIdentity}><span>공간에 온기를 더하다</span><strong>{interior.content.name}</strong></div>
                <div className={styles.cardQr}><QrCode size={62} strokeWidth={1.6} /><span>홈페이지 보기</span></div>
                <span className={styles.cardAddress}><Globe2 size={14} />ongyeol.example</span>
              </div>
            </div>
            <div className={styles.copy}>
              <p className={styles.category}>나를 알리는 가장 간단한 방법</p>
              <h3>명함 한 장으로,<br />내 홈페이지까지 소개해요.</h3>
              <p>명함에 홈페이지 주소와 QR 코드를 담아보세요. 만나는 사람에게 내 소개와 서비스를 한 번에 전할 수 있어요.</p>
            </div>
          </article>

          <article className={styles.benefit}>
            <div className={`${styles.scene} ${styles.portfolioScene}`} role="img" aria-label="인테리어 홈페이지에 거실, 주방, 욕실 시공 사진을 모아 소개하는 포트폴리오 예시">
              <div className={styles.portfolioBrowser}>
                <div className={styles.browserBar}><span /><span /><span /><Globe2 size={13} /><span>나의 시공 포트폴리오</span></div>
                <div className={styles.portfolioTitle}><span>{interior.content.name}</span><strong>말보다 확실한,<br />내가 만든 공간.</strong></div>
                <img className={styles.portfolioHero} src="/images/interior-editorial.webp" alt="" width={1536} height={1024} loading="lazy" />
                <div className={styles.portfolioGallery}>
                  <div><img src="/images/examples-expanded/interior-kitchen.webp" alt="" width={1440} height={960} loading="lazy" /><span>따뜻한 주방</span></div>
                  <div><img src="/images/examples-expanded/interior-bathroom.webp" alt="" width={1440} height={960} loading="lazy" /><span>편안한 욕실</span></div>
                </div>
              </div>
              <span className={styles.portfolioNote}><Check size={16} />내 작업이 쌓이는 포트폴리오</span>
            </div>
            <div className={styles.copy}>
              <p className={styles.category}>사진으로 보여주는 나의 실력</p>
              <h3>매번 설명하지 않아도,<br />작업 사진이 대신 말해요.</h3>
              <p>인테리어 시공 결과부터 나만의 작업물까지. 사진과 설명을 올려두면 고객이 직접 살펴보고 내 실력을 알아볼 수 있어요.</p>
            </div>
          </article>

          <article className={styles.benefit}>
            <div className={`${styles.scene} ${styles.inquiryScene}`} role="img" aria-label="고객이 홈페이지에서 주방 리모델링 견적을 문의하고, 홈페이지 주인이 문의함에서 확인하는 활용 예시">
              <div className={styles.inquirySheet}>
                <strong>견적·상담 문의</strong>
                <div className={styles.inquiryTypes}><span>견적 문의</span><span>일반 문의</span></div>
                <div className={styles.message}><p>주방 리모델링을 하고 싶어요.<br />예산과 일정을 알려주세요.</p></div>
                <div className={styles.sendIllustration}>문의 남기기</div>
              </div>
              <div className={styles.receivedInquiry}><span className={styles.receivedIcon}><Check size={19} /></span><div><span>내 문의함 · 접수 예시</span><strong>새 견적 문의가 도착했어요</strong><p>연락처와 내용을 확인하고 상담을 이어가요.</p></div></div>
            </div>
            <div className={styles.copy}>
              <p className={styles.category}>관심이 상담으로 이어지는 순간</p>
              <h3>마음에 든 바로 그때,<br />견적과 문의를 받아요.</h3>
              <p>홈페이지를 둘러본 고객이 견적이나 궁금한 점을 남겨요. 내 문의함에서 내용을 확인하고 다음 대화를 시작하세요.</p>
            </div>
          </article>
        </div>

        <div className={styles.footer}>
          <p>나를 알리고, 작업을 보여주고, 고객을 만나는 공간.<br /><strong>홈페이지 하나로 시작해 보세요.</strong></p>
          <button type="button" onClick={() => onPreview(interior)}>인테리어 홈페이지 직접 보기</button>
        </div>
        <p className={styles.disclosure}>이해를 돕기 위한 가상의 활용 장면입니다. 사진은 생성 이미지이며, 명함의 주소·QR 코드와 문의 화면은 예시예요.</p>
      </div>
    </section>
  );
}
