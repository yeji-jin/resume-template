import type { ResumeData } from "./schema";

let counter = 0;
/** 클라이언트 전용 간단 ID 생성 */
export function uid(prefix = "id"): string {
  counter += 1;
  return `${prefix}-${Date.now().toString(36)}-${counter}`;
}

/** "2026-02" 형태를 "2026-02" 로 그대로 노출하되 빈 종료일은 "현재" 처리 */
export function formatPeriod(start: string, end: string): string {
  const s = start || "";
  const e = end || "현재";
  if (!s && !end) return "";
  return `${s} - ${e}`;
}

/** YYYY-MM 두 값 사이 개월 수 계산 */
function monthsBetween(start: string, end: string): number {
  if (!start) return 0;
  const [sy, sm] = start.split("-").map(Number);
  const endStr = end || ymNow();
  const [ey, em] = endStr.split("-").map(Number);
  if (!sy || !sm || !ey || !em) return 0;
  return Math.max(0, (ey - sy) * 12 + (em - sm) + 1);
}

function ymNow(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** 현재 연-월 (YYYY-MM) — month input 기본값용 */
export function currentMonth(): string {
  return ymNow();
}

/** 전체 경력 합산 라벨: "경력 (1년 2개월)" 형태의 괄호 안 문자열 */
export function totalCareerLabel(data: ResumeData): string {
  const total = data.experiences.reduce(
    (acc, exp) => acc + monthsBetween(exp.start, exp.end),
    0
  );
  if (total <= 0) return "";
  const years = Math.floor(total / 12);
  const months = total % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}년`);
  if (months > 0) parts.push(`${months}개월`);
  return parts.join(" ") || "0개월";
}

export const STORAGE_KEY = "resume-template.resume";

/** 외부 JSON 등 신뢰할 수 없는 입력을 안전한 ResumeData로 정규화 */
export function normalizeResume(raw: unknown): ResumeData {
  const o = (raw ?? {}) as Partial<ResumeData>;
  const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
  const withId = <T extends { id?: string }>(items: T[], prefix: string): T[] =>
    items
      .filter((it) => it && typeof it === "object")
      .map((it) => ({ ...it, id: it.id || uid(prefix) }));

  return {
    name: typeof o.name === "string" ? o.name : "",
    phone: typeof o.phone === "string" ? o.phone : "",
    email: typeof o.email === "string" ? o.email : "",
    birth: typeof o.birth === "string" ? o.birth : "",
    address: typeof o.address === "string" ? o.address : "",
    photo: typeof o.photo === "string" ? o.photo : "",
    summary: typeof o.summary === "string" ? o.summary : "",
    experiences: withId(arr(o.experiences), "exp") as ResumeData["experiences"],
    educations: withId(arr(o.educations), "edu") as ResumeData["educations"],
    skills: withId(arr(o.skills), "sk") as ResumeData["skills"],
    projects: withId(arr(o.projects), "prj") as ResumeData["projects"],
  };
}
