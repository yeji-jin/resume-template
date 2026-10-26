import assert from "node:assert/strict";
import path from "node:path";
import { test } from "node:test";
import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { ResumeDocument, registerResumeFonts } from "../lib/resume/templates";
import { sampleResume, type ResumeData, type TemplateId } from "../lib/resume/types";

registerResumeFonts(path.resolve("public/fonts"));
const templates: TemplateId[] = ["clean", "professional", "formal", "modern", "simple"];
const normalize = (value: string) => value.replace(/\s/g, "");

async function extract(data: ResumeData, templateId: TemplateId) {
  const buffer = await renderToBuffer(<ResumeDocument data={data} templateId={templateId} />);
  const task = getDocument({ data: new Uint8Array(buffer), useSystemFonts: false, standardFontDataUrl: `${path.resolve("node_modules/pdfjs-dist/standard_fonts")}/` });
  try {
    const document = await task.promise;
    const texts: string[] = [];
    for (let number = 1; number <= document.numPages; number++) {
      const page = await document.getPage(number);
      const viewport = page.getViewport({ scale: 1 });
      assert.ok(Math.abs(viewport.width - 595.28) < 1, "A4 width");
      assert.ok(Math.abs(viewport.height - 841.89) < 1, "A4 height");
      const content = await page.getTextContent();
      const items = content.items.filter((item) => "str" in item);
      for (const item of items) {
        if (!item.str.trim()) continue;
        assert.ok(item.transform[5] > 5 && item.transform[5] < viewport.height, `text outside paper: ${item.str}`);
        assert.ok(item.transform[4] >= -1 && item.transform[4] + item.width <= viewport.width + 1, `text outside width: ${item.str}`);
      }
      texts.push(items.map((item) => item.str).join(""));
    }
    return { text: normalize(texts.join("")), pages: document.numPages, bytes: buffer.byteLength };
  } finally {
    await task.destroy();
  }
}

// Renderer/font state is shared, so keep document generation sequential.
for (const templateId of templates) {
  test(`${templateId}: Korean text and all resume fields survive PDF export`, async () => {
    const result = await extract(sampleResume, templateId);
    for (const expected of [sampleResume.name, sampleResume.phone, sampleResume.email,
      sampleResume.summary, sampleResume.experiences[0].description,
      sampleResume.educations[0].school, sampleResume.projects[0].description, "JavaScript"]) {
      assert.ok(result.text.includes(normalize(expected)), `missing text: ${expected.slice(0, 30)}`);
    }
    assert.ok(result.pages <= 2, "sample should stay compact");
    assert.ok(result.bytes < 1_000_000, "embed subset fonts instead of rasterized pages");
  });

  test(`${templateId}: oversized descriptions flow without losing or duplicating lines`, async () => {
    const data = structuredClone(sampleResume);
    const markers = Array.from({ length: 100 }, (_, i) => `LINE${String(i).padStart(3, "0")}END`);
    data.experiences[0].description = markers.map((marker) => `${marker} 긴 경력 설명을 다음 페이지까지 이어서 표시합니다.`).join("\n");
    data.projects = Array.from({ length: 6 }, (_, i) => ({ ...sampleResume.projects[0], id: `p${i}`, name: `PROJECT${i}END` }));
    const result = await extract(data, templateId);
    assert.ok(result.pages >= 3 && result.pages < 15);
    for (const marker of [...markers, ...data.projects.map((project) => project.name)]) {
      assert.equal(result.text.split(marker).length - 1, 1, `${marker} must appear exactly once`);
    }
  });
}

test("professional: sidebar can continue independently of the body", async () => {
  const data = structuredClone(sampleResume);
  data.skills = Array.from({ length: 100 }, (_, i) => ({ id: `s${i}`, name: `SKILL${String(i).padStart(3, "0")}END`, level: "상" }));
  const result = await extract(data, "professional");
  assert.ok(result.pages >= 2);
  for (const skill of data.skills) assert.equal(result.text.split(skill.name).length - 1, 1);
  assert.ok(result.text.includes(normalize(data.projects[0].description)));
});
