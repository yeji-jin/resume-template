import type { ResumeData } from "./schema";

export type { ResumeData, Experience, Education, Skill, Project } from "./schema";

export type TemplateId = "clean" | "professional" | "formal" | "modern" | "simple";

export interface TemplateMeta {
  id: TemplateId;
  name: string;
  description: string;
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: "clean",
    name: "깔끔한",
    description: "단일 컬럼, 얇은 구분선으로 정돈된 범용 이력서",
  },
  {
    id: "professional",
    name: "프로페셔널",
    description: "2단 레이아웃, 좌측 인적사항/스킬 + 우측 경력/학력",
  },
  {
    id: "formal",
    name: "정형 이력서",
    description: "전통 표 기반 한국식 이력서 양식",
  },
  {
    id: "modern",
    name: "모던",
    description: "타임라인 경력 표시, 네이비 악센트 포인트",
  },
  {
    id: "simple",
    name: "심플",
    description: "장식 없이 타이포그래피와 여백만으로 구성",
  },
];

export const emptyResume: ResumeData = {
  name: "",
  phone: "",
  email: "",
  birth: "",
  address: "",
  photo: "",
  summary: "",
  experiences: [],
  educations: [],
  skills: [],
  projects: [],
};

export const sampleResume: ResumeData = {
  name: "홍길동",
  phone: "010-1234-5678",
  email: "hong@example.com",
  birth: "1995.01.01",
  address: "서울특별시 강남구",
  photo: "",
  summary:
    "사용자 경험을 중심에 두는 프론트엔드 개발자 홍길동입니다. 직관적인 화면 구성과 자연스러운 사용자 흐름 설계를 강점으로 하며, 단순 구현이 아닌 '왜 필요한 기능인지'부터 고민하는 개발을 지향합니다. 프로젝트에서는 화면 구조를 재설계해 사용자 동선을 단순화하고, 컴포넌트 재사용 구조를 적용해 유지보수 효율을 높이는 데 기여했습니다.",
  experiences: [
    {
      id: "exp-1",
      company: "㈜샘플컴퍼니",
      team: "개발팀",
      role: "프론트엔드 개발자",
      start: "2023-01",
      end: "",
      description:
        "웹 서비스 프론트엔드 개발을 담당하며 React 기반 화면 구현 및 기능 개발을 수행했습니다. 사용자 요구사항을 분석해 주요 화면 5개를 신규 개발하고, 컴포넌트 구조를 재설계하여 재사용 가능한 UI 구조를 구축했습니다. 그 결과 코드 중복을 줄이고 유지보수 시간을 약 30% 단축했습니다.",
    },
  ],
  educations: [
    {
      id: "edu-1",
      school: "샘플대학교",
      major: "컴퓨터공학과",
      degree: "대학교(4년)",
      status: "졸업",
      gpa: "4.0/4.5",
      start: "2016-03",
      end: "2022-02",
    },
  ],
  skills: [
    { id: "sk-1", name: "JavaScript", level: "상" },
    { id: "sk-2", name: "React", level: "상" },
    { id: "sk-3", name: "TypeScript", level: "중" },
  ],
  projects: [
    {
      id: "prj-1",
      name: "샘플 프로젝트",
      start: "2022-06",
      end: "2022-12",
      description:
        "팀 프로젝트로 웹 애플리케이션을 기획부터 배포까지 진행했습니다. 핵심 기능을 설계하고 구현하며 사용자 피드백을 반영해 완성도를 높였습니다.",
    },
  ],
};
