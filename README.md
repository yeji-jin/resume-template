# 이력서 작성 (resume-template)

브라우저에서 바로 이력서를 작성하고, 템플릿을 골라 PDF/PNG로 내보낼 수 있는 프로젝트

**데모**: [https://resume-template-ashy-alpha.vercel.app/](https://resume-template-ashy-alpha.vercel.app/)

## 주요 기능

- **폼 작성**: 인적사항, 자기소개, 경력, 학력, 스킬, 프로젝트를 항목 추가/삭제/순서 변경하며 작성
- **드래그 앤 드롭 순서 변경**: 경력/학력/프로젝트 카드를 드래그해 순서 변경 (위/아래 버튼도 함께 제공)
- **다중 이력서 슬롯**: 여러 개의 이력서를 만들어두고 이름을 붙여 전환
- **자동 저장**: 입력 중 800ms 디바운스로 브라우저 `localStorage`에 자동 저장
- **입력 형식 검증**: 이름/연락처 필수 입력, 연락처·이메일 형식 검증 (zod)
- **다크 모드**: 시스템 설정 감지 + 수동 토글 (이력서 미리보기 화면 자체는 항상 흰 종이 톤 유지)
- **템플릿 5종**: 깔끔한 / 프로페셔널 / 정형 이력서 / 모던 / 심플
- **A4 페이지 미리보기**: React PDF가 자동으로 페이지를 나누고, 제목과 첫 설명 줄·문단의 최소 줄 수를 보호
- **PDF / PNG 내보내기**: 한글 텍스트를 선택·검색할 수 있는 PDF와, 동일한 PDF 페이지들을 세로로 연결한 PNG 다운로드 (일반/고화질은 PNG에 적용)
- **JSON 내보내기 / 가져오기**: 이 앱에서 내보낸 JSON 파일을 다시 불러와 이어서 편집

## 기술 스택

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4 + [shadcn/ui](https://ui.shadcn.com)
- [react-hook-form](https://react-hook-form.com) + [zod](https://zod.dev) — 폼 상태 및 유효성 검증
- [@tanstack/react-query](https://tanstack.com/query) — `localStorage` 저장소를 query/mutation으로 래핑한 로딩·자동저장 상태 관리
- [@react-pdf/renderer](https://react-pdf.org) — PDF 템플릿, 한글 폰트 임베딩, 자동 페이지 분할
- [PDF.js](https://mozilla.github.io/pdf.js/) — 생성된 PDF를 PNG로 변환할 때만 사용
- [@dnd-kit](https://dndkit.com) — 경력/학력/프로젝트 드래그 앤 드롭 순서 변경
- [next-themes](https://github.com/pacocoursey/next-themes) — 다크 모드

## 시작하기

Node.js 22.13 이상(22 LTS) 또는 24 이상이 필요합니다. `.nvmrc`는 22.21.0을 사용합니다.

```bash
nvm use
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

```bash
npm run build   # 프로덕션 빌드
npm run start   # 빌드 결과 실행
npm run lint    # ESLint 검사
npm run test:pdf # 5개 템플릿의 한글/긴 문서/사이드바 PDF 회귀 검사
```

## 프로젝트 구조

```
app/
  page.tsx            이력서 작성 페이지 (폼 ↔ 미리보기 전환, 슬롯/자동저장 orchestration)
  layout.tsx           루트 레이아웃, 폰트(Noto Sans KR)
  providers.tsx        QueryClientProvider + ThemeProvider + Toaster
components/
  resume/               이력서 기능 전용 컴포넌트 (폼, 미리보기, 슬롯바, 사진 업로드)
  theme-toggle.tsx       다크/라이트 모드 토글 버튼
  ui/                   shadcn/ui 컴포넌트
hooks/
  useResumeStore.ts     localStorage 저장소를 react-query로 감싼 커스텀 훅
lib/resume/
  schema.ts             zod 스키마 (ResumeData), 필수/형식 검증 규칙
  types.ts               템플릿 메타데이터, 빈/샘플 이력서 데이터
  templates.tsx           React PDF 템플릿 5종, 제목/문단 분할 규칙
  pdf.tsx                 PDF 생성, PDF.js 미리보기/PNG 변환, 다운로드
  storage.ts               localStorage read/write, 구버전 마이그레이션
  utils.ts                 기간 계산, ID 생성, JSON 정규화 등 유틸
```

## PDF 구성

- `templates.tsx`의 `Document`, `Page`, `View`, `Text`로 문서를 작성합니다. A4 배치와 줄 단위 분할은 React PDF가 처리합니다.
- `wrap={false}`는 짧은 헤더에만 사용하고, 경력·프로젝트의 긴 설명은 분할을 허용합니다. `minPresenceAhead`, `orphans`, `widows`로 제목과 문단이 어색하게 분리되는 것을 줄입니다.
- 프로페셔널 템플릿은 왼쪽 정보와 오른쪽 본문을 배치하고, 짙은 배경을 모든 페이지에 반복합니다.
- `usePDF`가 PDF 생성 상태, Blob URL, 미리보기를 관리합니다. 미리보기는 브라우저 PDF 뷰어를 사용하므로 별도의 DOM 높이 측정이나 페이지 계산이 없습니다.
- PDF에는 Noto Sans KR에서 고정 두께로 만든 `Resume Sans KR` Regular/Bold를 포함하며 [SIL OFL 라이선스](public/fonts/OFL-NotoSansKR.txt)를 함께 배포합니다.
- PDF.js는 PNG 버튼을 누를 때만 동적으로 불러옵니다.
- PNG는 여러 페이지를 하나의 이미지로 연결합니다. 브라우저 캔버스 크기 한도를 넘는 문서는 일반 화질이나 PDF로 저장하도록 안내합니다.
