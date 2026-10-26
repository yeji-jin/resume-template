import React, { type ReactNode } from "react";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ResumeData, TemplateId } from "./types";
import { formatPeriod, totalCareerLabel } from "./utils";

/** Browser URLs by default; an absolute directory can be supplied by Node tests. */
export function registerResumeFonts(base = "/fonts") {
  Font.register({
    family: "Resume Sans KR",
    fonts: [
      { src: `${base}/ResumeSansKR-Regular.ttf`, fontWeight: 400 },
      { src: `${base}/ResumeSansKR-Bold.ttf`, fontWeight: 700 },
    ],
  });
  Font.registerHyphenationCallback((word) => [word]);
}

const styles = StyleSheet.create({
  page: { fontFamily: "Resume Sans KR", fontSize: 10.5, color: "#262626", padding: 42, lineHeight: 1.7, backgroundColor: "#ffffff" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 14, borderBottomWidth: 0.7, borderBottomColor: "#d4d4d4", marginBottom: 20 },
  name: { fontSize: 27, fontWeight: 700, lineHeight: 1.4 },
  contact: { fontSize: 9, color: "#737373", marginTop: 8 },
  photo: { width: 66, height: 84, objectFit: "cover", borderRadius: 4, marginLeft: 16 },
  section: { marginBottom: 20 },
  heading: { fontSize: 13, fontWeight: 700, marginBottom: 10, paddingBottom: 6, borderBottomWidth: 0.5, borderBottomColor: "#e5e5e5" },
  item: { marginBottom: 15 },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  itemTitle: { fontSize: 11.5, fontWeight: 700, flexGrow: 1, flexShrink: 1 },
  period: { fontSize: 8.5, color: "#8a8a8a", flexShrink: 0, paddingTop: 2 },
  detail: { fontSize: 9.5, color: "#737373", marginTop: 2 },
  body: { fontSize: 10.5, lineHeight: 1.85, color: "#525252", marginTop: 5 },
  footer: { position: "absolute", bottom: 14, right: 30, fontSize: 8, color: "#a3a3a3" },
  sidebarBackground: { position: "absolute", top: 0, bottom: 0, left: 0, width: 195, backgroundColor: "#1f2937" },
  columns: { flexDirection: "row", alignItems: "flex-start" },
  sidebar: { width: 195, paddingHorizontal: 21, color: "#ffffff" },
  main: { width: 400.28, paddingHorizontal: 27 },
  sideLabel: { fontSize: 8, color: "#a3a3a3", marginTop: 12, marginBottom: 2 },
  sideValue: { fontSize: 9.5, color: "#f5f5f5", lineHeight: 1.6 },
  skillRow: { flexDirection: "row", justifyContent: "space-between", gap: 8, marginBottom: 5 },
  timeline: { borderLeftWidth: 1.5, borderLeftColor: "#e5e5e5", paddingLeft: 16, marginLeft: 5 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  chip: { backgroundColor: "#e8edf6", borderRadius: 12, color: "#1e3a8a", paddingHorizontal: 9, paddingVertical: 3, fontSize: 9.5 },
  tableRow: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#d4d4d4", borderLeftWidth: 0.5, borderLeftColor: "#d4d4d4" },
  cell: { padding: 7, borderRightWidth: 0.5, borderRightColor: "#d4d4d4", fontSize: 9.5 },
  tableHead: { backgroundColor: "#f5f5f5", borderTopWidth: 0.5, borderTopColor: "#d4d4d4", fontWeight: 700 },
});

const join = (parts: (string | undefined)[]) => parts.filter(Boolean).join(" · ");
const contact = (data: ResumeData) => [data.phone, data.email, data.birth, data.address].filter(Boolean).join("   |   ");
const educationDetail = (edu: ResumeData["educations"][number]) => join([edu.degree, edu.status, edu.gpa && `학점 ${edu.gpa}`]);

function Heading({ children, templateId }: { children: ReactNode; templateId: TemplateId }) {
  const variant = templateId === "professional"
    ? { color: "#1f2937", borderBottomColor: "#ff6000", borderBottomWidth: 1.5 }
    : templateId === "modern"
      ? { color: "#64748b", fontSize: 10, letterSpacing: 1.5, borderBottomWidth: 0 }
      : templateId === "simple"
        ? { color: "#737373", fontSize: 9, letterSpacing: 1.5, borderBottomWidth: 0 }
        : {};
  return <Text style={[styles.heading, variant]} minPresenceAhead={65}>{children}</Text>;
}

function Section({ title, templateId, children }: { title: string; templateId: TemplateId; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Heading templateId={templateId}>{title}</Heading>
      {children}
    </View>
  );
}

/** React PDF keeps this header with the first lines; long descriptions remain
 * breakable. Never set wrap={false} on an arbitrarily long description. */
function Entry({ title, period, detail, description, modern = false }: {
  title: string; period: string; detail?: string; description?: string; modern?: boolean;
}) {
  return (
    <View style={modern ? [styles.item, styles.timeline] : styles.item}>
      <View wrap={false} minPresenceAhead={description ? 48 : 0}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemTitle}>{title}</Text>
          <Text style={styles.period}>{period}</Text>
        </View>
        {detail && <Text style={styles.detail}>{detail}</Text>}
      </View>
      {description && <Text style={styles.body} orphans={2} widows={2}>{description}</Text>}
    </View>
  );
}

function ResumeHeader({ data, templateId }: { data: ResumeData; templateId: TemplateId }) {
  return (
    <View style={[styles.header, templateId === "simple" || templateId === "modern" ? { borderBottomWidth: 0 } : {}]} wrap={false}>
      <View style={{ flex: 1, ...(templateId === "modern" ? { borderLeftWidth: 3, borderLeftColor: "#1e3a8a", paddingLeft: 15 } : {}) }}>
        <Text style={[styles.name, templateId === "modern" ? { color: "#1e3a8a" } : {}]}>{data.name || "이름"}</Text>
        <Text style={styles.contact}>{contact(data)}</Text>
      </View>
      {data.photo && templateId !== "simple" && (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image src={data.photo} style={[styles.photo, templateId === "modern" ? { width: 72, height: 72, borderRadius: 36 } : {}]} />
      )}
    </View>
  );
}

function BodySections({ data, templateId }: { data: ResumeData; templateId: TemplateId }) {
  const career = totalCareerLabel(data);
  const modern = templateId === "modern";
  return (
    <>
      {data.summary && (
        <Section title="자기소개" templateId={templateId}>
          <Text style={styles.body} orphans={2} widows={2}>{data.summary}</Text>
        </Section>
      )}
      {data.experiences.length > 0 && (
        <Section title={`${modern ? "EXPERIENCE" : "경력"}${career ? ` · ${career}` : ""}`} templateId={templateId}>
          {data.experiences.map((exp) => <Entry key={exp.id} title={exp.company} period={formatPeriod(exp.start, exp.end)} detail={join([exp.team, exp.role])} description={exp.description} modern={modern} />)}
        </Section>
      )}
      {data.educations.length > 0 && (
        <Section title={modern ? "EDUCATION" : "학력"} templateId={templateId}>
          {data.educations.map((edu) => <Entry key={edu.id} title={join([edu.school, edu.major])} period={formatPeriod(edu.start, edu.end)} detail={educationDetail(edu)} />)}
        </Section>
      )}
      {data.skills.length > 0 && templateId !== "professional" && (
        <Section title={modern ? "SKILLS" : "보유 스킬"} templateId={templateId}>
          {modern ? (
            <View style={styles.chips}>
              {data.skills.map((skill) => <Text key={skill.id} style={styles.chip} wrap={false}>{skill.name} · {skill.level}</Text>)}
            </View>
          ) : <Text style={styles.body}>{data.skills.map((skill) => `${skill.name}(${skill.level})`).join(" · ")}</Text>}
        </Section>
      )}
      {data.projects.length > 0 && (
        <Section title={modern ? "PROJECTS" : "프로젝트"} templateId={templateId}>
          {data.projects.map((project) => <Entry key={project.id} title={project.name} period={formatPeriod(project.start, project.end)} description={project.description} />)}
        </Section>
      )}
    </>
  );
}

function Professional({ data }: { data: ResumeData }) {
  return (
    <>
      <View style={styles.sidebarBackground} fixed />
      <View style={styles.columns}>
        <View style={styles.sidebar}>
          <View wrap={false}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            {data.photo && <Image src={data.photo} style={{ width: 84, height: 96, objectFit: "cover", borderRadius: 5, marginBottom: 15 }} />}
            <Text style={[styles.name, { fontSize: 24 }]}>{data.name || "이름"}</Text>
          </View>
          {[["연락처", data.phone], ["이메일", data.email], ["생년월일", data.birth], ["주소", data.address]].map(([label, value]) => value && (
            <View key={label}>
              <Text style={styles.sideLabel} minPresenceAhead={24}>{label}</Text>
              <Text style={styles.sideValue}>{value}</Text>
            </View>
          ))}
          {data.skills.length > 0 && (
            <View style={{ marginTop: 26 }}>
              <Text style={{ fontSize: 11, fontWeight: 700, color: "#ff8a4c", marginBottom: 10 }} minPresenceAhead={30}>SKILLS</Text>
              {data.skills.map((skill) => (
                <View key={skill.id} style={styles.skillRow} wrap={false}>
                  <Text style={[styles.sideValue, { flex: 1 }]}>{skill.name}</Text>
                  <Text style={{ fontSize: 9, color: "#a3a3a3" }}>{skill.level}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={styles.main}>
          <BodySections data={data} templateId="professional" />
        </View>
      </View>
    </>
  );
}

function TableRow({ cells, widths, header = false }: { cells: string[]; widths: number[]; header?: boolean }) {
  return (
    <View style={header ? [styles.tableRow, styles.tableHead] : styles.tableRow} wrap={!header} minPresenceAhead={header ? 36 : 0}>
      {cells.map((cell, index) => (
        <View key={index} style={[styles.cell, { width: `${widths[index]}%` }]}>
          <Text orphans={2} widows={2}>{cell}</Text>
        </View>
      ))}
    </View>
  );
}

function Formal({ data }: { data: ResumeData }) {
  return (
    <>
      <Text style={[styles.name, { textAlign: "center", letterSpacing: 8, marginBottom: 20 }]} minPresenceAhead={110}>이력서</Text>
      <View style={{ flexDirection: "row", gap: 12, marginBottom: 22 }} wrap={false}>
        <View style={{ flex: 1, borderTopWidth: 0.5, borderTopColor: "#d4d4d4" }}>
          <TableRow cells={["성명", data.name, "생년월일", data.birth]} widths={[15, 35, 20, 30]} />
          <TableRow cells={["연락처", data.phone, "이메일", data.email]} widths={[15, 35, 20, 30]} />
          <TableRow cells={["주소", data.address]} widths={[15, 85]} />
        </View>
        <View style={{ width: 72, height: 90, borderWidth: 0.5, borderColor: "#d4d4d4", alignItems: "center", justifyContent: "center" }}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          {data.photo ? <Image src={data.photo} style={{ width: 71, height: 89, objectFit: "cover" }} /> : <Text style={styles.detail}>사진</Text>}
        </View>
      </View>
      {data.educations.length > 0 && (
        <Section title="학력사항" templateId="formal">
          <TableRow cells={["기간", "학교명", "전공", "구분"]} widths={[25, 25, 25, 25]} header />
          {data.educations.map((edu) => <TableRow key={edu.id} cells={[formatPeriod(edu.start, edu.end), edu.school, edu.major, educationDetail(edu)]} widths={[25, 25, 25, 25]} />)}
        </Section>
      )}
      {data.experiences.length > 0 && (
        <Section title="경력사항" templateId="formal">
          <TableRow cells={["기간", "회사명", "담당업무"]} widths={[23, 23, 54]} header />
          {data.experiences.map((exp) => <TableRow key={exp.id} cells={[formatPeriod(exp.start, exp.end), exp.company, [join([exp.team, exp.role]), exp.description].filter(Boolean).join("\n")]} widths={[23, 23, 54]} />)}
        </Section>
      )}
      {data.skills.length > 0 && (
        <Section title="보유 기술" templateId="formal">
          <Text style={styles.body}>{data.skills.map((skill) => `${skill.name}(${skill.level})`).join(" · ")}</Text>
        </Section>
      )}
      {data.summary && (
        <Section title="자기소개서" templateId="formal">
          <Text style={styles.body} orphans={2} widows={2}>{data.summary}</Text>
        </Section>
      )}
      {data.projects.length > 0 && (
        <Section title="프로젝트" templateId="formal">
          <TableRow cells={["기간", "프로젝트명", "내용"]} widths={[23, 23, 54]} header />
          {data.projects.map((project) => <TableRow key={project.id} cells={[formatPeriod(project.start, project.end), project.name, project.description]} widths={[23, 23, 54]} />)}
        </Section>
      )}
    </>
  );
}

export function ResumeDocument({ data, templateId }: { data: ResumeData; templateId: TemplateId }) {
  return (
    <Document title={`${data.name || "이력서"}_이력서`} author={data.name} language="ko">
      <Page size="A4" wrap style={[styles.page, templateId === "professional" ? { paddingHorizontal: 0, paddingVertical: 36 } : templateId === "simple" ? { padding: 48 } : {}]}>
        {templateId === "professional" ? <Professional data={data} /> : templateId === "formal" ? <Formal data={data} /> : (
          <>
            <ResumeHeader data={data} templateId={templateId} />
            <BodySections data={data} templateId={templateId} />
          </>
        )}
        <Text style={styles.footer} fixed render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
}
