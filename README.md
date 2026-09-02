# 이력서 작성 (resume-template)

브라우저에서 바로 이력서를 작성하고, 템플릿을 골라 PDF/PNG로 내보낼 수 있는 프로젝트

## 주요 기능

- **폼 작성**: 인적사항, 자기소개, 경력, 학력, 스킬, 프로젝트를 항목 추가/삭제/순서 변경하며 작성
- **다중 이력서 슬롯**: 여러 개의 이력서를 만들어두고 이름을 붙여 전환
- **자동 저장**: 입력 중 800ms 디바운스로 브라우저 `localStorage`에 자동 저장
- **템플릿 5종**: 깔끔한 / 프로페셔널 / 정형 이력서 / 모던 / 심플
- **PDF / PNG 내보내기**: 미리보기 화면을 캡처해 다운로드
- **JSON 내보내기 / 가져오기**: 이 앱에서 내보낸 JSON 파일을 다시 불러와 이어서 편집

## 기술 스택

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- [Tailwind CSS](https://tailwindcss.com) v4 + [shadcn/ui](https://ui.shadcn.com)
- [react-hook-form](https://react-hook-form.com) + [zod](https://zod.dev) — 폼 상태 및 유효성 검증
- [@tanstack/react-query](https://tanstack.com/query) — `localStorage` 저장소를 query/mutation으로 래핑한 로딩·자동저장 상태 관리
- [html2canvas](https://html2canvas.hertzen.com) + [jsPDF](https://github.com/parallax/jsPDF) — PDF/PNG 내보내기

## 시작하기

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) 에서 확인할 수 있습니다.

```bash
npm run build   # 프로덕션 빌드
npm run start   # 빌드 결과 실행
npm run lint    # ESLint 검사
```

## 프로젝트 구조

```
app/
  page.tsx            이력서 작성 페이지 (폼 ↔ 미리보기 전환, 슬롯/자동저장 orchestration)
  layout.tsx           루트 레이아웃, 폰트(Noto Sans KR)
  providers.tsx        QueryClientProvider + Toaster
components/
  resume/               이력서 기능 전용 컴포넌트 (폼, 미리보기, 슬롯바, 사진 업로드)
  ui/                   shadcn/ui 컴포넌트
hooks/
  useResumeStore.ts     localStorage 저장소를 react-query로 감싼 커스텀 훅
lib/resume/
  schema.ts             zod 스키마 (ResumeData)
  types.ts               템플릿 메타데이터, 빈/샘플 이력서 데이터
  templates.tsx           템플릿 5종 렌더링 컴포넌트
  storage.ts               localStorage read/write, 구버전 마이그레이션
  utils.ts                 기간 계산, ID 생성, JSON 정규화 등 유틸
```
