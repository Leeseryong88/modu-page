# 디자인과 이미지 기록

## 2026-11-20: 모두의 이야기를 위한 개편

현재 랜딩은 개인 포트폴리오·창작자·전문가·클래스·매장을 함께 소개합니다. 사용예시 탭(`/use-cases`)은 명함·블로그·이력서·제안 메일·SNS에서 홈페이지로 연결되는 장면과 전송 없는 문의 체험을 제공합니다. 만드는 방법은 실제 편집기처럼 상단·중단·하단을 눌러 내용과 템플릿을 선택하는 모달 체험입니다.

내장 이미지 생성 도구로 다음 5장을 추가 제작했습니다. 모두 생성 후 WebP로 최적화했으며 실제 인물이나 고객 성과로 소개하지 않습니다. 전체 프롬프트·원본·최종 경로는 [생성 기록](generated-use-case-assets.json)에 보관했습니다.

- `public/images/use-cases/business-card.webp`: 명함으로 소개를 이어가는 장면
- `public/images/use-cases/professional.webp`: 독립 전문가의 상담 공간
- `public/images/use-cases/creative-work.webp`: 디자이너의 작업과 창작 오브제
- `public/images/use-cases/workshop.webp`: 종이 공예를 함께하는 클래스
- `public/images/use-cases/photographer.webp`: 사진가의 카메라와 인화 작업물

아래는 이전 개편의 기록입니다.

2026-11-19 작업. 사용자가 제공한 https://www.yuhadesign.com/ 은 **업체가 만드는 공개 홈페이지**의 참고 자료다. 큰 공간 사진, 단순한 메뉴, 넉넉한 여백, 사진 아래의 짧은 설명을 참고했다. 레퍼런스의 사진·로고·문구를 복사하지 않았다. 최초 요구사항의 좌우 분할 대표 영역과 사진 위에 글자를 겹치지 않는 원칙을 유지했다.

현재 랜딩은 ‘사장님이 직접 만들기 → 주소 공개 → 전화·카카오톡 문의’ 흐름을 전면에 둔다. 카페·이사업체·꽃집·인테리어의 완성 예시와 이름·업종 입력 체험을 제공한다. 실제 고객 목록을 조회하지 않으며 예시와 생성 사진은 실제 고객 실적으로 표시하지 않는다. 예시는 `src/lib/examples.ts`의 정적 데이터이고 Firebase에 등록하지 않는다.

## 다양한 업종을 위한 추가 이미지

내장 `image_gen`으로 사진 6장을 새로 생성하고 WebP로 인코딩했다. 원본 내용을 합성·수정하지 않았다. 최종 사용 파일은 아래와 같으며 전체 프롬프트와 생성 원본 경로는 [생성 기록](generated-example-assets.json)에 있다.

- `public/images/examples/cafe.webp`: 동네 카페 공간
- `public/images/examples/cafe-detail.webp`: 커피와 크루아상
- `public/images/examples/florist.webp`: 꽃집의 작업대와 공간
- `public/images/examples/florist-detail.webp`: 계절 꽃다발
- `public/images/examples/moving.webp`: 이삿짐을 옮기는 작업 현장
- `public/images/examples/moving-detail.webp`: 가구 보호 포장

모두 1536×1024이다. 카페·꽃집·이사 예시의 대표 사진과 갤러리에 연결했다. 기존 아래 2장은 인테리어 예시에 사용한다. 앱 실행이나 빌드 시 이미지 재생성은 필요 없다.

## 제작 방식과 결과물

내장 `image_gen`으로 새 이미지 2장을 생성했다. 원본의 내용을 수정하거나 합성하지 않고 Sharp로 WebP 인코딩하여 웹 용량을 줄였다. 외부 이미지 주소나 생성 서비스에 대한 실행 시 의존성이 없다.

- `public/images/interior-editorial.webp`: 1536×1024, 약 109 KiB. 인테리어 예시 대표 사진.
- `public/images/craft-materials.webp`: 1536×1024, 약 323 KiB. 인테리어 예시 재료 사진.
- `scripts/prepare-marketing-assets.mjs`: 생성 원본을 WebP로 변환한 수동 실행 기록. 이미 완성된 이미지가 포함되어 있어 실행할 필요가 없다. 다른 컴퓨터에서 원본을 다시 인코딩하려면 이 스크립트의 원본 경로를 바꾼다.
- `src/components/landing.tsx`, `landing.css`: 서비스 랜딩 구성.
- `src/components/business-template.tsx`, `business-template.css`: 사용자가 만드는 홈페이지와 미리보기의 공통 구성.

한글 글꼴은 `@fontsource-variable/noto-sans-kr` 패키지에서 로컬 제공한다. 포인트 색상 5종은 기존 공통 토큰을 사용한다.

## 생성 프롬프트 1

Use case: photorealistic-natural. Asset type: homepage editorial hero photograph for a Korean small-business website creation service. Create one sophisticated, believable architectural photograph of a freshly renovated modest Korean apartment living room viewed through a very slender charcoal steel and clear glass sliding partition. Warm natural oak floor, off-white plaster walls with subtle texture, an understated linen sofa partially visible, simple oak cabinet, soft daylight coming from an out-of-frame window, quiet natural shadows. Restrained lived-in interior, a small ceramic vessel and one casually placed book, no staged luxury mansion. Real estate editorial photography, 35mm lens, straight verticals, natural lens perspective, fine wood grain, slight material irregularity, sophisticated neutral color grading, no HDR glow. Landscape composition, approximately 3:2 ratio, architecture and quality workmanship are the subject. No text, no logos, no watermark, no people, no UI, no illustration, no 3D render appearance. This is an illustrative marketing asset, not a photograph of a real business or customer project.

## 생성 프롬프트 2

Use case: photorealistic-natural. Asset type: supporting editorial photograph for a Korean service helping local tradespeople create their own business website. Create a quiet documentary still life showing the craft behind renovation work: a natural oak work surface with several large off-white stone and warm beige ceramic tile samples, an oak wood sample, a graphite pencil, a neatly folded pale canvas cloth, a simple small steel tape measure, and one paper architectural sketch without legible writing. Cropped close at a gentle oblique angle, not top-down flat lay. Natural side window light, deep tactile texture in stone, grain and paper, believable subtle scratches on the tools. Composition feels like an architectural magazine, not stock photography. Horizontal 3:2 photograph. Colors warm grey, natural oak, cream and charcoal. No plants, no decorative pointless accessories, no hands, no people, no branding, no readable text, no watermark, no UI. Photorealistic, no CGI, no glossy synthetic materials.
# 2026-11-19 히어로 추가 변경

사용자 요청에 따라 인테리어·카페·꽃집 홈페이지가 동시에 만들어지는 모습을 새로 생성했습니다. 인테리어를 가장 크게, 나머지 두 업종을 오른쪽에 배치하고 사진 선택 테두리·커서·편집 조각으로 제작 과정을 표현했습니다. 실제 편집기 화면이 아닌 설명용 이미지임을 캡션에 표시합니다.

- 사용 도구: 내장 이미지 생성 도구
- 적용 파일: `public/images/site-creation-hero.webp` (1448 × 1086, 약 199 KB)
- 전체 생성 프롬프트와 원본 위치: `docs/generated-hero-asset.json`
- 히어로는 생성 이미지, 아래 예시 영역은 직접 열리는 실제 HTML 홈페이지의 가로 캐러셀입니다.

## 2026-11-21: 예시별 사진 확장

대표 이미지와 같은 사진을 상세 사례에 반복하던 구성을 제거했습니다. 총 10개 예시가 각각 대표 1장 + 상세 3장, 총 40개의 고유 이미지 경로를 사용합니다. 전문가(변호사)와 클래스·모임(독서 모임) 예시를 추가했습니다.

새 사진 27장은 내장 이미지 생성 도구로 개별 제작하고 1440px WebP로 최적화했습니다(합계 약 4.25MiB). 최종 파일은 `public/images/examples-expanded/`, 전체 프롬프트와 원본 경로는 `generated-expanded-example-assets.json`에 있습니다. 기존 이미지 13장은 해당 예시의 주제에 맞춰 유지합니다. 생성 이미지와 예시는 실제 고객 사례가 아닙니다.

사진 품질 검토용 모음: `screenshots/expanded-assets-review-1.jpg`, `expanded-assets-review-2.jpg`, `expanded-assets-review-3.jpg`. 실제 예시의 작업명과 설명도 각 상세 사진의 내용에 맞춰 작성했습니다.
