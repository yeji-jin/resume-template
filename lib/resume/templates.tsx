import type { ReactNode } from "react";
import type { ResumeData, TemplateId } from "./types";
import { formatPeriod, totalCareerLabel } from "./utils";

/** A4 너비(96dpi 기준 794px). 높이는 내용에 따라 늘어남 */
export const PAGE_WIDTH = 794;

interface TemplateProps {
  data: ResumeData;
}

function contactLine(data: ResumeData): string {
  return [data.phone, data.email, data.birth, data.address]
    .filter(Boolean)
    .join("   |   ");
}

function skillText(data: ResumeData): string {
  return data.skills.map((s) => `${s.name}(${s.level})`).join(" · ");
}

/* ───────────────────────── 1. 깔끔한 (clean) ───────────────────────── */
function CleanTemplate({ data }: TemplateProps) {
  const career = totalCareerLabel(data);
  return (
    <div
      style={{ width: PAGE_WIDTH }}
      className="bg-white px-14 py-14 font-sans text-[#262626]"
    >
      <div className="flex items-start justify-between gap-6 border-b border-neutral-300 pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            {data.name || "이름을 입력하세요"}
          </h1>
          <div className="mt-3 text-sm text-neutral-500">
            {contactLine(data)}
          </div>
        </div>
        {data.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.photo}
            alt=""
            className="h-28 w-[88px] shrink-0 rounded-md object-cover"
          />
        )}
      </div>

      {data.summary && (
        <Section title="자기소개">
          <p className="text-[15px] leading-7 text-neutral-700">
            {data.summary}
          </p>
        </Section>
      )}

      {data.experiences.length > 0 && (
        <Section title={`경력${career ? ` (${career})` : ""}`}>
          <div className="space-y-6">
            {data.experiences.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-bold">{exp.company}</h3>
                  <span className="text-sm text-neutral-400">
                    {formatPeriod(exp.start, exp.end)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {[exp.team, exp.role].filter(Boolean).join(" · ")}
                </p>
                {exp.description && (
                  <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-neutral-700">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.educations.length > 0 && (
        <Section title="학력">
          <div className="space-y-4">
            {data.educations.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-bold">
                    {edu.school} {edu.major}
                  </h3>
                  <span className="text-sm text-neutral-400">
                    {formatPeriod(edu.start, edu.end)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">
                  {[edu.degree, edu.status, edu.gpa && `학점 ${edu.gpa}`]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {data.skills.length > 0 && (
        <Section title="보유 스킬">
          <p className="text-[15px] text-neutral-700">{skillText(data)}</p>
        </Section>
      )}

      {data.projects.length > 0 && (
        <Section title="프로젝트">
          <div className="space-y-5">
            {data.projects.map((prj) => (
              <div key={prj.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-bold">{prj.name}</h3>
                  <span className="text-sm text-neutral-400">
                    {formatPeriod(prj.start, prj.end)}
                  </span>
                </div>
                {prj.description && (
                  <p className="mt-2 whitespace-pre-line text-[15px] leading-7 text-neutral-700">
                    {prj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}
    </div>
  );

  function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
      <section className="mt-8">
        <h2 className="mb-3 border-b border-neutral-200 pb-2.5 text-lg font-bold leading-snug">
          {title}
        </h2>
        {children}
      </section>
    );
  }
}

/* ──────────────────── 2. 프로페셔널 (professional) ──────────────────── */
function ProfessionalTemplate({ data }: TemplateProps) {
  const career = totalCareerLabel(data);
  return (
    <div
      style={{ width: PAGE_WIDTH }}
      className="flex min-h-[400px] bg-white font-sans text-[#262626]"
    >
      {/* 좌측 사이드 */}
      <aside className="w-[260px] shrink-0 bg-[#1f2937] px-7 py-12 text-white">
        {data.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.photo}
            alt=""
            className="mb-5 h-32 w-28 rounded-lg object-cover ring-2 ring-white/20"
          />
        )}
        <h1 className="text-3xl font-bold leading-tight">
          {data.name || "이름"}
        </h1>
        <div className="mt-8 space-y-3 text-[13px] text-neutral-300">
          {data.phone && <SideItem label="연락처" value={data.phone} />}
          {data.email && <SideItem label="이메일" value={data.email} />}
          {data.birth && <SideItem label="생년월일" value={data.birth} />}
          {data.address && <SideItem label="주소" value={data.address} />}
        </div>

        {data.skills.length > 0 && (
          <div className="mt-10">
            <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-[#FF8a4c]">
              Skills
            </h2>
            <ul className="space-y-2 text-[13px] text-neutral-200">
              {data.skills.map((s) => (
                <li key={s.id} className="flex justify-between">
                  <span>{s.name}</span>
                  <span className="text-neutral-400">{s.level}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>

      {/* 우측 본문 */}
      <div className="flex-1 px-9 py-12">
        {data.summary && (
          <RightSection title="자기소개">
            <p className="text-[14px] leading-7 text-neutral-700">
              {data.summary}
            </p>
          </RightSection>
        )}

        {data.experiences.length > 0 && (
          <RightSection title={`경력${career ? ` · ${career}` : ""}`}>
            <div className="space-y-5">
              {data.experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-[15px] font-bold">{exp.company}</h3>
                    <span className="text-xs text-neutral-400">
                      {formatPeriod(exp.start, exp.end)}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    {[exp.team, exp.role].filter(Boolean).join(" · ")}
                  </p>
                  {exp.description && (
                    <p className="mt-2 whitespace-pre-line text-[13.5px] leading-7 text-neutral-700">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </RightSection>
        )}

        {data.educations.length > 0 && (
          <RightSection title="학력">
            <div className="space-y-3">
              {data.educations.map((edu) => (
                <div key={edu.id} className="flex items-baseline justify-between">
                  <div>
                    <h3 className="text-[15px] font-bold">
                      {edu.school} {edu.major}
                    </h3>
                    <p className="text-xs text-neutral-500">
                      {[edu.degree, edu.status, edu.gpa && `학점 ${edu.gpa}`]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="text-xs text-neutral-400">
                    {formatPeriod(edu.start, edu.end)}
                  </span>
                </div>
              ))}
            </div>
          </RightSection>
        )}

        {data.projects.length > 0 && (
          <RightSection title="프로젝트">
            <div className="space-y-4">
              {data.projects.map((prj) => (
                <div key={prj.id}>
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-[15px] font-bold">{prj.name}</h3>
                    <span className="text-xs text-neutral-400">
                      {formatPeriod(prj.start, prj.end)}
                    </span>
                  </div>
                  {prj.description && (
                    <p className="mt-1 whitespace-pre-line text-[13.5px] leading-7 text-neutral-700">
                      {prj.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </RightSection>
        )}
      </div>
    </div>
  );

  function SideItem({ label, value }: { label: string; value: string }) {
    return (
      <div>
        <p className="text-[11px] uppercase tracking-wider text-neutral-500">
          {label}
        </p>
        <p className="text-[13px] text-neutral-100">{value}</p>
      </div>
    );
  }

  function RightSection({ title, children }: { title: string; children: ReactNode }) {
    return (
      <section className="mb-7">
        <h2 className="mb-3 text-base font-bold text-[#1f2937]">
          <span className="inline-block border-b-2 border-[#FF6000] pb-1.5 leading-snug">
            {title}
          </span>
        </h2>
        {children}
      </section>
    );
  }
}

/* ─────────────────────── 3. 정형 이력서 (formal) ─────────────────────── */
function FormalTemplate({ data }: TemplateProps) {
  return (
    <div
      style={{ width: PAGE_WIDTH }}
      className="bg-white px-12 py-12 font-sans text-[#262626]"
    >
      <h1 className="mb-6 text-center text-3xl font-bold tracking-[0.4em]">
        이력서
      </h1>

      <div className="flex gap-4">
        <table className="flex-1 border-collapse text-sm">
          <tbody>
            <tr>
              <Th>성명</Th>
              <Td>{data.name}</Td>
              <Th>생년월일</Th>
              <Td>{data.birth}</Td>
            </tr>
            <tr>
              <Th>연락처</Th>
              <Td>{data.phone}</Td>
              <Th>이메일</Th>
              <Td>{data.email}</Td>
            </tr>
            <tr>
              <Th>주소</Th>
              <td className="border border-neutral-300 px-3 py-2" colSpan={3}>
                {data.address}
              </td>
            </tr>
          </tbody>
        </table>
        <div className="flex h-[120px] w-[96px] shrink-0 items-center justify-center overflow-hidden border border-neutral-300 bg-neutral-50 text-xs text-neutral-400">
          {data.photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.photo} alt="" className="h-full w-full object-cover" />
          ) : (
            "사진"
          )}
        </div>
      </div>

      {data.educations.length > 0 && (
        <FormalBlock title="학력사항">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <Th>기간</Th>
                <Th>학교명</Th>
                <Th>전공</Th>
                <Th>구분</Th>
              </tr>
            </thead>
            <tbody>
              {data.educations.map((edu) => (
                <tr key={edu.id}>
                  <Td>{formatPeriod(edu.start, edu.end)}</Td>
                  <Td>{edu.school}</Td>
                  <Td>{edu.major}</Td>
                  <Td>{[edu.degree, edu.status].filter(Boolean).join(" / ")}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormalBlock>
      )}

      {data.experiences.length > 0 && (
        <FormalBlock title="경력사항">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <Th>기간</Th>
                <Th>회사명</Th>
                <Th>담당업무</Th>
              </tr>
            </thead>
            <tbody>
              {data.experiences.map((exp) => (
                <tr key={exp.id}>
                  <Td>{formatPeriod(exp.start, exp.end)}</Td>
                  <Td>{exp.company}</Td>
                  <td className="border border-neutral-300 px-3 py-2 align-top">
                    <p className="font-medium">
                      {[exp.team, exp.role].filter(Boolean).join(" · ")}
                    </p>
                    {exp.description && (
                      <p className="mt-1 whitespace-pre-line text-[13px] leading-6 text-neutral-600">
                        {exp.description}
                      </p>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormalBlock>
      )}

      {data.skills.length > 0 && (
        <FormalBlock title="보유 기술">
          <p className="px-1 py-2 text-sm text-neutral-700">{skillText(data)}</p>
        </FormalBlock>
      )}

      {data.summary && (
        <FormalBlock title="자기소개서">
          <p className="whitespace-pre-line px-1 py-2 text-sm leading-7 text-neutral-700">
            {data.summary}
          </p>
        </FormalBlock>
      )}

      {data.projects.length > 0 && (
        <FormalBlock title="프로젝트">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-neutral-50">
                <Th>기간</Th>
                <Th>프로젝트명</Th>
                <Th>내용</Th>
              </tr>
            </thead>
            <tbody>
              {data.projects.map((prj) => (
                <tr key={prj.id}>
                  <Td>{formatPeriod(prj.start, prj.end)}</Td>
                  <Td>{prj.name}</Td>
                  <td className="border border-neutral-300 px-3 py-2 align-top text-[13px] leading-6 text-neutral-600">
                    {prj.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </FormalBlock>
      )}
    </div>
  );

  function Th({ children }: { children?: ReactNode }) {
    return (
      <th className="w-[110px] border border-neutral-300 bg-neutral-100 px-3 py-2 text-left font-semibold text-neutral-600">
        {children}
      </th>
    );
  }
  function Td({ children }: { children?: ReactNode }) {
    return (
      <td className="border border-neutral-300 px-3 py-2 align-top">{children}</td>
    );
  }
  function FormalBlock({ title, children }: { title: string; children: ReactNode }) {
    return (
      <div className="mt-7">
        <h2 className="mb-2 text-base font-bold">{title}</h2>
        {children}
      </div>
    );
  }
}

/* ─────────────────────────── 4. 모던 (modern) ─────────────────────────── */
function ModernTemplate({ data }: TemplateProps) {
  const career = totalCareerLabel(data);
  return (
    <div
      style={{ width: PAGE_WIDTH }}
      className="bg-white px-14 py-14 font-sans text-[#1e293b]"
    >
      <header className="flex items-center justify-between gap-6">
        <div className="border-l-4 border-[#1e3a8a] pl-5">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#1e3a8a]">
            {data.name || "이름"}
          </h1>
          <p className="mt-2 text-sm text-neutral-500">{contactLine(data)}</p>
        </div>
        {data.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={data.photo}
            alt=""
            className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-[#1e3a8a]/10"
          />
        )}
      </header>

      {data.summary && (
        <p className="mt-7 text-[15px] leading-7 text-neutral-700">{data.summary}</p>
      )}

      {data.experiences.length > 0 && (
        <ModernSection title={`EXPERIENCE${career ? ` · ${career}` : ""}`}>
          <div className="relative ml-2 border-l-2 border-neutral-200 pl-6">
            {data.experiences.map((exp) => (
              <div key={exp.id} className="relative mb-7 last:mb-0">
                <span className="absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#1e3a8a]" />
                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-bold">{exp.company}</h3>
                  <span className="text-xs font-medium text-[#1e3a8a]">
                    {formatPeriod(exp.start, exp.end)}
                  </span>
                </div>
                <p className="text-sm text-neutral-500">
                  {[exp.team, exp.role].filter(Boolean).join(" · ")}
                </p>
                {exp.description && (
                  <p className="mt-2 whitespace-pre-line text-[14px] leading-7 text-neutral-700">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ModernSection>
      )}

      {data.educations.length > 0 && (
        <ModernSection title="EDUCATION">
          <div className="space-y-3">
            {data.educations.map((edu) => (
              <div key={edu.id} className="flex items-baseline justify-between">
                <div>
                  <h3 className="text-base font-bold">
                    {edu.school} {edu.major}
                  </h3>
                  <p className="text-sm text-neutral-500">
                    {[edu.degree, edu.status, edu.gpa && `학점 ${edu.gpa}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </div>
                <span className="text-xs font-medium text-[#1e3a8a]">
                  {formatPeriod(edu.start, edu.end)}
                </span>
              </div>
            ))}
          </div>
        </ModernSection>
      )}

      {data.skills.length > 0 && (
        <ModernSection title="SKILLS">
          <div className="flex flex-wrap gap-2">
            {data.skills.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-[#1e3a8a]/10 px-3 py-1 text-sm font-medium text-[#1e3a8a]"
              >
                {s.name} · {s.level}
              </span>
            ))}
          </div>
        </ModernSection>
      )}

      {data.projects.length > 0 && (
        <ModernSection title="PROJECTS">
          <div className="space-y-4">
            {data.projects.map((prj) => (
              <div key={prj.id}>
                <div className="flex items-baseline justify-between">
                  <h3 className="text-base font-bold">{prj.name}</h3>
                  <span className="text-xs font-medium text-[#1e3a8a]">
                    {formatPeriod(prj.start, prj.end)}
                  </span>
                </div>
                {prj.description && (
                  <p className="mt-1 whitespace-pre-line text-[14px] leading-7 text-neutral-700">
                    {prj.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </ModernSection>
      )}
    </div>
  );

  function ModernSection({ title, children }: { title: string; children: ReactNode }) {
    return (
      <section className="mt-8">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-neutral-400">
          {title}
        </h2>
        {children}
      </section>
    );
  }
}

/* ─────────────────────────── 5. 심플 (simple) ─────────────────────────── */
function SimpleTemplate({ data }: TemplateProps) {
  const career = totalCareerLabel(data);
  return (
    <div
      style={{ width: PAGE_WIDTH }}
      className="bg-white px-16 py-16 font-sans text-[#333]"
    >
      <h1 className="text-3xl font-semibold">{data.name || "이름"}</h1>
      <p className="mt-2 text-[13px] text-neutral-400">{contactLine(data)}</p>

      {data.summary && (
        <p className="mt-8 text-[15px] leading-8 text-neutral-600">{data.summary}</p>
      )}

      {data.experiences.length > 0 && (
        <SimpleSection title={`경력${career ? ` (${career})` : ""}`}>
          {data.experiences.map((exp) => (
            <div key={exp.id} className="mb-5 last:mb-0">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[15px] font-semibold">{exp.company}</h3>
                <span className="text-xs text-neutral-400">
                  {formatPeriod(exp.start, exp.end)}
                </span>
              </div>
              <p className="text-[13px] text-neutral-400">
                {[exp.team, exp.role].filter(Boolean).join(" · ")}
              </p>
              {exp.description && (
                <p className="mt-1.5 whitespace-pre-line text-[14px] leading-7 text-neutral-600">
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </SimpleSection>
      )}

      {data.educations.length > 0 && (
        <SimpleSection title="학력">
          {data.educations.map((edu) => (
            <div key={edu.id} className="mb-2 flex items-baseline justify-between last:mb-0">
              <span className="text-[14px]">
                {edu.school} {edu.major}
                <span className="text-neutral-400">
                  {" "}
                  {[edu.degree, edu.status].filter(Boolean).join(" · ")}
                </span>
              </span>
              <span className="text-xs text-neutral-400">
                {formatPeriod(edu.start, edu.end)}
              </span>
            </div>
          ))}
        </SimpleSection>
      )}

      {data.skills.length > 0 && (
        <SimpleSection title="스킬">
          <p className="text-[14px] text-neutral-600">{skillText(data)}</p>
        </SimpleSection>
      )}

      {data.projects.length > 0 && (
        <SimpleSection title="프로젝트">
          {data.projects.map((prj) => (
            <div key={prj.id} className="mb-4 last:mb-0">
              <div className="flex items-baseline justify-between">
                <h3 className="text-[15px] font-semibold">{prj.name}</h3>
                <span className="text-xs text-neutral-400">
                  {formatPeriod(prj.start, prj.end)}
                </span>
              </div>
              {prj.description && (
                <p className="mt-1 whitespace-pre-line text-[14px] leading-7 text-neutral-600">
                  {prj.description}
                </p>
              )}
            </div>
          ))}
        </SimpleSection>
      )}
    </div>
  );

  function SimpleSection({ title, children }: { title: string; children: ReactNode }) {
    return (
      <section className="mt-9">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-neutral-400">
          {title}
        </h2>
        {children}
      </section>
    );
  }
}

/* ─────────────────────────── 디스패처 ─────────────────────────── */
export function ResumeTemplate({
  templateId,
  data,
}: {
  templateId: TemplateId;
  data: ResumeData;
}) {
  switch (templateId) {
    case "professional":
      return <ProfessionalTemplate data={data} />;
    case "formal":
      return <FormalTemplate data={data} />;
    case "modern":
      return <ModernTemplate data={data} />;
    case "simple":
      return <SimpleTemplate data={data} />;
    case "clean":
    default:
      return <CleanTemplate data={data} />;
  }
}
