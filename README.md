# 모두의페이지

개인, 창작자, 전문가, 클래스와 매장이 자신만의 한 페이지 홈페이지를 조립하고 공개하는 서비스입니다. Next.js App Router, TypeScript strict, Tailwind CSS, shadcn/ui 방식의 Radix UI 컴포넌트, Firebase Authentication·Firestore·Storage와 Firebase Admin SDK를 사용합니다.

## 구현한 흐름

- 개인과 비즈니스를 함께 소개하는 랜딩: 실제 방식과 같은 상·중·하단 모달 편집 체험, FAQ
- 용도별 예시 갤러리: 개인·창작자 / 전문가 / 클래스·모임 / 매장·비즈니스 필터, 추가 보기, 전체 홈페이지 열기
- 서로 다른 조합의 가상 예시 8개: 포트폴리오, 전문가, 클래스, 사진가, 카페, 이사, 꽃집, 인테리어 (`/examples/[slug]`)
- `/use-cases` 사용예시 탭: 명함·전문가 상담·포트폴리오·프리랜서·클래스·매장 사례 6종, 공유→홈페이지→문의 체험, 내 이름과 색상 바꾸기
- 구글 계정으로 회원가입·로그인·로그아웃 (이메일·비밀번호 입력과 재설정 화면 제거)
- 계정당 홈페이지 하나, 상단·중단·하단을 직접 눌러 모달에서 작성, 미완성 임시저장, 저장 시각·미저장 변경 안내
- 대표 사진·로고·작업 사진 등록/교체/삭제, 서비스·작업 사례의 위아래 순서 변경
- 전체 화면에서 편집·미리보기 전환, 데스크톱·모바일 화면, 포인트 색상 5개
- 상단·중단·하단 각 4개 템플릿을 독립 조합(64가지), 내용 보존, 모달 적용·취소, 공개 전 누락 항목으로 바로 이동
- 사용자 주소 확인, 최초 공개, 공개 내용 업데이트, 비공개, 현재 초안으로 재공개
- 공개 주소 복사, 전화·카카오톡·외부 링크, 사진 확대·이전/다음·ESC·포커스 복귀
- 공개 홈페이지 문의 양식: 비로그인 방문자 접수, 필수 정보·동의 검증, 중복 접수 방지
- `/dashboard/inquiries` 별도 문의함: 전체·새 문의·상담 중·완료 집계, 상태별 목록, 상세 연락처, 내부 메모, 삭제
- 홈페이지별 SEO·OG·canonical, 관리/작성/미리보기/문의함 검색 제외

서비스 이름과 로고 문구, 템플릿 내부 이름, 색상은 `src/lib/brand.ts` 한곳에서 변경합니다. 템플릿은 `src/components/business-template.tsx`를 미리보기와 공개 페이지가 함께 사용합니다. CSS container query로 실제 표시 영역의 폭에 반응하며, 모바일 화면을 축소한 그림으로 대체하지 않습니다.

사용자가 제공한 레퍼런스는 업체 홈페이지의 사진·여백·메뉴 구성에 반영했습니다. 랜딩은 개인·창작자·전문가·모임·사업자를 모두 위한 내용으로 개편했습니다. 사용 장면과 새 예시를 위한 사진 5장을 추가 생성하고 WebP로 최적화했습니다. 생성 기록은 `docs/generated-use-case-assets.json`에 있습니다. 예시는 Firebase 고객 데이터에 저장하지 않는 정적 데모이며, 연락 버튼은 설명창을 열어 실제 연락을 시작하지 않습니다. 실제 고객 홈페이지의 전화·카카오톡 연결은 그대로 동작합니다.

랜딩과 예시 사이트는 Firebase 설정 없이 `npm run dev`만으로 볼 수 있습니다. 회원가입·저장·공개는 아래 Firebase 또는 에뮬레이터 설정이 필요합니다. 공개 사이트의 문의 양식은 실제 Firestore에 접수되며 업체 소유자만 문의함에서 확인합니다. 예시와 편집 미리보기의 양식은 체험 안내만 표시하고 접수하지 않습니다. 이미지 경로와 제작 기록은 [디자인·에셋 문서](docs/design-assets.md), 화면과 검증 결과는 [검증 문서](docs/verification.md)에 있습니다.

## 빠른 실행

Node.js 20.19 이상과 Java 21 이상(에뮬레이터 사용 시)이 필요합니다. 설치된 정확한 패키지 버전은 `package-lock.json`으로 고정되어 있습니다.

```powershell
cd D:\모두페이지\woori-upche
npm ci
```

기존 Firebase 프로젝트에 연결하려면 `.env.example`을 `.env.local`로 복사하고 다음 설정 절차를 진행한 뒤 실행합니다.

```powershell
Copy-Item .env.example .env.local
npm run dev
```

환경변수가 없으면 연결 준비 안내/오류를 표시합니다. 가짜 계정, 가짜 저장 성공, localStorage를 이용한 저장 대체는 없습니다.

## 실제 Firebase 연결 없이 로컬 검증

서로 다른 터미널 두 개를 엽니다.

```powershell
# 첫 번째 터미널
npm run emulators
```

```powershell
# 두 번째 터미널
npm run dev:local
```

브라우저에서 `http://127.0.0.1:3000`을 엽니다. 실제 Firebase SDK와 로컬 Auth·Firestore·Storage 에뮬레이터가 통신합니다. `demo-woori` 프로젝트만 사용하고 운영 Firebase에는 접근하지 않습니다. Google 버튼을 누르면 에뮬레이터의 가상 Google 계정 선택 화면에서 로그인할 수 있습니다.

에뮬레이터 관리 화면은 `http://127.0.0.1:4000`입니다. 비밀번호 재설정 메일은 실제로 발송되지 않고 에뮬레이터의 터미널에 확인 링크가 나타납니다. 기본 실행은 에뮬레이터 종료 시 테스트 데이터가 사라집니다. 브라우저 재접속은 저장된 에뮬레이터 데이터를 유지합니다. `dev:local`은 `.env.local`을 수정하지 않고 해당 프로세스에만 테스트 설정을 전달합니다.

## 필요한 환경변수

Firebase 콘솔 → 프로젝트 설정 → 등록된 웹 앱의 설정에서 다음 공개 설정을 복사합니다.

- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

서버 전용 설정은 다음과 같습니다. 서비스 계정 키 파일은 필수가 아닙니다. 현재 서버 코드는 명시적인 키가 없으면 Application Default Credentials를 사용합니다. Firebase App Hosting·Cloud Run·Cloud Functions처럼 Google이 관리하는 서버에서는 실행 계정의 권한을 이용할 수 있으므로 개인키를 다운로드해 넣을 필요가 없습니다. 외부 서버에서 개인키 방식으로 연결하는 경우에만 아래 서비스 계정 이메일·개인키를 설정합니다. [Firebase 공식 인증 안내](https://firebase.google.com/docs/admin/setup#initialize_the_sdk)

웹 앱의 `firebaseConfig`는 브라우저에서 프로젝트에 연결하기 위한 설정이며 서버 접근 권한을 대신하지 않습니다. 서비스 계정 키를 사용하는 경우 채팅, 저장소, 클라이언트 코드에 넣지 않습니다.

- `FIREBASE_PROJECT_ID`: 같은 Firebase 프로젝트 ID
- `FIREBASE_STORAGE_BUCKET`: 콘솔에 표시되는 정확한 버킷 이름. `.appspot.com` 또는 `.firebasestorage.app`을 추측하지 말고 그대로 복사합니다.
- `INQUIRY_RATE_LIMIT_SECRET`: 32자 이상의 임의 서버 전용 값. 문의 중복 판별과 반복 접수 제한에 사용하며 `NEXT_PUBLIC_` 접두사를 붙이지 않습니다. 없으면 접수를 성공으로 표시하지 않고 연결 안내를 반환합니다.
- `FIREBASE_CLIENT_EMAIL`: 서비스 계정 이메일
- `FIREBASE_PRIVATE_KEY`: 서비스 계정 개인키. `.env.local`에서는 예제처럼 따옴표로 감싸고 줄바꿈을 `\n`으로 작성할 수 있습니다. Vercel에서는 실제 여러 줄 키도 지원합니다.

추가 설정:

- `NEXT_PUBLIC_SITE_URL`: 실제 접근할 origin, 예: `https://your-domain.example`. 끝에 `/` 없이 설정합니다. canonical, OG, 주소 표시, 요청 출처 검증에 사용합니다. Vercel Preview 환경도 그 환경에 접속할 정확한 주소로 설정해야 합니다.
- `NEXT_PUBLIC_USE_FIREBASE_EMULATORS`: 운영에서는 `false`. Vercel에서 `true`이면 서버가 요청을 거부합니다.

## Firebase 콘솔 설정

1. Authentication의 로그인 방법에서 **Google**을 활성화하고 지원 이메일을 선택합니다. **이메일/비밀번호** 제공자는 비활성화합니다. 기존 계정 자체는 삭제하지 않습니다.
2. Authentication의 승인된 도메인에 개발용 `localhost`, `127.0.0.1`과 실제 운영 도메인을 등록합니다.
3. Google 계정 선택 팝업으로 가입·로그인을 확인합니다. `/signup`과 `/login` 모두 Google을 사용하고 `/reset-password`는 `/login`으로 이동합니다.
4. Firestore Database를 만들고 서버와 가까운 리전을 선택합니다.
5. Storage 버킷을 생성합니다. 프로젝트의 현재 요금제와 Storage 사용 조건은 Firebase 콘솔에서 확인합니다.
6. 서버 실행 환경의 인증을 연결합니다. Firebase App Hosting 등 Google 관리 서버에서는 실행 계정의 기본 인증을 사용하고, 개인키 방식의 외부 서버에서는 서비스 계정 키를 서버 전용 환경변수로 설정합니다. 서버 계정에는 해당 프로젝트의 Authentication 세션 처리, Firestore, Storage 접근 권한이 필요합니다.
7. 다음 보안 규칙을 **서비스 공개 전에** 적용합니다.

```powershell
npx firebase login
npx firebase deploy --only firestore:rules,firestore:indexes,storage --project 실제-Firebase-프로젝트-ID
```

기존 프로젝트라면 이 명령이 해당 프로젝트의 규칙을 교체하므로 `firestore.rules`, `storage.rules`를 기존 앱의 규칙과 먼저 병합하세요. 이 서비스의 전용 프로젝트에서는 그대로 적용할 수 있습니다. Firebase Admin SDK는 규칙을 우회하므로 모든 변경 API에서도 인증·소유권·입력 검증을 수행합니다.

문의 목록의 상태 필터에는 `firestore.indexes.json`의 `messages` 복합 색인이 필요합니다. 규칙과 색인을 배포하고 색인 생성이 완료된 뒤 실제 문의 접수 → 문의함 조회 → 상태 변경을 확인하세요.

## Vercel 배포

1. 저장소를 Vercel에 연결하고 Root Directory를 이 프로젝트 폴더로 지정합니다.
2. Framework Preset은 Next.js, Install Command는 `npm ci`, Build Command는 `npm run build`를 사용합니다.
3. 위 환경변수를 Production/Preview에 각각 등록합니다. `NEXT_PUBLIC_` 설정은 빌드에 포함되므로 변경 후 새 배포가 필요합니다.
4. Firebase 승인된 도메인에 실제 Vercel 주소 또는 서비스 도메인을 추가합니다.
5. 보안 규칙 적용 후 배포합니다. 별도의 정적 export는 사용하지 않습니다. 서버 라우트와 Admin SDK가 필요합니다.
6. 운영에서 회원가입 → 미완성 저장 → 사진 등록 → 공개 → 다른 브라우저에서 열기 → 비공개 순서로 점검합니다.

현재 결과물은 Vercel용 소스입니다. 사용자의 Firebase 설정·서비스 계정·Vercel 계정에 연결하거나 운영 배포하지 않았습니다.

## 저장·공개·권한 설계

- `sites/{uid}`: 소유자 전용 초안, 마지막 공개본, 상태, 최초 공개일, revision. 이메일은 이 문서나 공개본에 넣지 않습니다.
- `sites/{uid}/media/{id}`: 소유자의 검증된 이미지 메타데이터
- `slugs/{slug}`: 서버 전용 영구 주소 예약. 비공개로 전환해도 예약은 유지합니다.
- `publicSites/{slug}`: 공개 중인 사이트의 정보만 저장. 공개 페이지가 이 스냅샷을 읽으며, 랜딩의 예시 목록은 별도의 정적 데모를 사용합니다.
- `users/{uid}/media/{id}`: Firebase Storage의 서버 전용 이미지
- `inboxes/{uid}`: 홈페이지 편집 데이터와 독립된 상태별 문의 집계
- `inboxes/{uid}/messages/{requestId}`: 문의 내용·연락처·동의 시각·처리 상태·내부 메모. 클라이언트 SDK 직접 접근을 모두 차단하고 인증된 소유자 API만 사용합니다.
- `inquiryLimits/{key}`: 서버 전용 반복 접수 제한. 연락처 기반 키는 HMAC 처리합니다.

공개에 필요한 내용은 이름, 페이지 용도, 한 줄 소개, 대표 이미지입니다. 전화번호·지역은 선택사항이며 문의 기능을 사용하지 않는 소개형 페이지도 만들 수 있습니다. 문의 유형은 일반·협업/채용·상담·참여/수강·견적·예약/주문·기타를 지원합니다.

임시저장은 초안만 변경합니다. 공개는 필수 정보를 검증하고 주소 예약·초안·공개본을 **하나의 Firestore 트랜잭션**으로 처리합니다. 동일 주소 동시 요청은 한 계정만 성공합니다. 계정의 UID를 문서 ID로 사용하고 revision 검사를 하므로 여러 탭에서 공개해도 홈페이지는 하나만 생성되며, 오래된 탭이 새 저장 내용을 덮어쓰지 못합니다.

비공개는 공개 스냅샷을 제거합니다. 존재하지 않는/비공개 주소는 실제 HTTP 404입니다. 공개 페이지, 목록, 이미지 응답은 공유 캐시를 사용하지 않으므로 다음 요청부터 변경 상태가 일관되게 반영됩니다. 이미 방문자가 내려받거나 캡처한 내용까지 회수할 수는 없습니다.

초안 이미지는 공개 URL 토큰을 발급하지 않습니다. 이미지 API는 공개본의 참조 여부 또는 소유자의 HttpOnly 세션 쿠키를 확인합니다. Firebase Storage의 직접 읽기와 직접 쓰기는 모두 차단합니다. 세션 변경은 Origin을 검사하며, 서버 변경 API는 ID 토큰을 검증합니다.

## 이미지 처리와 수명주기

원본은 JPG·PNG·WebP, 파일당 5MB 이하입니다. 브라우저에서 방향을 반영해 최대 2560px로 조정하여 Vercel 요청 제한 안으로 전송합니다. 서버는 다시 실제 이미지 형식·픽셀 수를 검증하고 WebP로 변환하며 메타데이터를 제거합니다. MIME을 PNG로 위장한 SVG도 거부합니다. 업로드 진행률·재시도·교체 전 기존 이미지 유지가 구현되어 있습니다.

삭제는 먼저 초안의 참조만 제거합니다. 마지막 공개본이 참조하는 파일은 남겨두며, 공개 업데이트 후 새 참조 관계로 외부 접근을 판정합니다. 실패하거나 사용하지 않은 업로드는 즉시 지우지 않습니다.

`node scripts/cleanup-media.mjs`는 7일이 지난 미참조 이미지 수를 확인하는 **기본 dry run**입니다. 실제 삭제가 필요하면 운영 담당자가 결과를 검토한 뒤 `--apply`를 붙여 실행할 수 있습니다. 초안과 마지막 공개본을 트랜잭션에서 다시 확인하고 `deleting`으로 표시하므로 동시 저장/공개와 충돌할 때 참조 중인 파일을 삭제하지 않습니다. 자동 예약이나 운영 삭제는 설정하지 않았습니다.

## 검증 명령

```powershell
npm run test
npm run lint
npm run build
npm run typecheck
```

독립적인 에뮬레이터 통합 검사(기존 에뮬레이터를 종료한 상태):

```powershell
npm run test:firebase
```

실행 중인 `npm run emulators` + `npm run dev:local`에 대한 실제 HTTP 검사:

```powershell
npm run test:http
```

자세한 실제 검증 결과와 미검증 범위는 `docs/verification.md`를 참고하세요. 로컬 화면용 가상 업체·검토 이미지는 명시적인 테스트 도구에서만 사용하며 운영 데이터에 자동 생성하지 않습니다.

## 주요 파일

- `src/components/editor.tsx`: 직접 클릭하는 3영역 모달 편집 흐름
- `src/components/section-fields.tsx`: 영역별 입력 항목·사진·서비스
- `src/components/section-template-picker.tsx`: 템플릿 선택 카드
- `src/lib/section-layouts.ts`: 영역 안내·12개 템플릿 정의
- `src/components/business-template.tsx`: 공통 업체 홈페이지 템플릿
- `src/lib/schema.ts`: 저장 스키마, 주소 규칙, 공개 필수 검증
- `src/lib/server/sites.ts`: 저장·주소 예약·공개·비공개 트랜잭션
- `src/app/api/media`: 이미지 업로드·권한 검사
- `firestore.rules`, `storage.rules`: 실제 접근 제어 규칙
- `.env.example`: 환경변수 예시

구현 과정에서 [Next.js 공식 설치 문서](https://nextjs.org/docs/app/getting-started/installation), [Firebase 세션 쿠키 문서](https://firebase.google.com/docs/auth/admin/manage-cookies), [Firestore 트랜잭션 문서](https://firebase.google.com/docs/firestore/manage-data/transactions)를 확인했습니다.

## 문의 접수와 문의함

홈페이지를 공개하면 문의 양식이 포함됩니다. 고객은 성함·연락처·문의 종류·지역(선택)·내용을 입력하고 정보 제공에 동의합니다. 접수 API는 공개 스냅샷에서 소유자를 결정하며 클라이언트가 임의 소유자를 지정할 수 없습니다.

접수와 집계는 하나의 트랜잭션으로 처리합니다. 같은 요청의 재전송은 한 건으로 취급합니다. 같은 홈페이지·연락처는 1분 내 반복 접수와 시간당 5건을 제한하고, 홈페이지당 하루 200건까지 접수합니다. 상태 변경과 삭제도 집계를 함께 갱신하며 오래된 화면에서 덮어쓰기는 거부합니다.

문의함은 홈페이지 편집과 별도 화면·저장소를 사용합니다. 홈페이지를 수정하거나 비공개로 바꿔도 기존 문의는 유지되며 비공개 상태에서는 새 문의를 받지 않습니다. 삭제 확인 후에는 연락처·문의·메모가 영구 삭제되고 건수에서 제외됩니다. 이메일·문자·카카오톡 자동 발송은 포함하지 않으며, 사장님은 문의함에서 연락처를 확인해 답변합니다.

로컬 서버가 이미 3000번에서 실행 중이라면 별도 검증 서버를 다음처럼 실행할 수 있습니다.

```powershell
$env:LOCAL_APP_PORT="3002"
$env:NEXT_DIST_DIR=".next-inquiries"
npm run dev:local
# 다른 터미널에서 동일한 LOCAL_APP_PORT를 지정하고 npm run test:http
```

## Google 로그인 전환

GoogleAuthProvider와 signInWithPopup을 사용합니다. 별도의 Google 비밀키 환경변수는 추가하지 않습니다. 팝업 차단·취소·미승인 도메인·계정 충돌은 화면에 안내하고, 서버 세션 확인이 끝나야 관리 화면으로 이동합니다. 서버 인증과 기존 Firebase 설정은 여전히 필요합니다.

운영 Firebase 콘솔에서 Google 제공자 활성화, 이메일/비밀번호 제공자 비활성화, 배포 도메인 승인을 적용해야 합니다. 이 저장소 변경만으로 콘솔 설정은 변경되지 않습니다. 기존 계정 데이터는 UID를 기준으로 보관하며 자동 데이터 이전이나 계정 삭제를 수행하지 않습니다. 다른 로그인 수단과의 계정 충돌은 관리자 확인이 필요합니다.

기존 HTTP 검사에서 사용하는 이메일 계정은 로컬 에뮬레이터의 API 권한 검사 전용입니다. Google OAuth 실제 운영 검증을 대신하지 않습니다.
