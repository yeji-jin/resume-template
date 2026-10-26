"use client";

import { useEffect, useMemo, useState } from "react";
import { usePDF } from "@react-pdf/renderer";
import { ChevronLeft, Check, Download, Loader2, ImageDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ResumeData, TemplateId } from "@/lib/resume/types";
import { TEMPLATES } from "@/lib/resume/types";
import { ResumeDocument, registerResumeFonts } from "@/lib/resume/templates";

registerResumeFonts();

type Quality = "normal" | "high";

interface Props {
  data: ResumeData;
  templateId: TemplateId;
  onTemplateChange: (id: TemplateId) => void;
  onBack: () => void;
}

export default function ResumePreview({
  data,
  templateId,
  onTemplateChange,
  onBack,
}: Props) {
  const [savingImg, setSavingImg] = useState(false);
  const [quality, setQuality] = useState<Quality>("normal");
  const document = useMemo(
    () => <ResumeDocument data={data} templateId={templateId} />,
    [data, templateId],
  );
  const [pdf, updatePdf] = usePDF();

  useEffect(() => {
    updatePdf(document);
  }, [document, updatePdf]);

  const ready = Boolean(pdf.blob && pdf.url && !pdf.loading && !pdf.error);
  const busy = pdf.loading || savingImg;

  const safeName = () => (data.name || "resume").replace(/[\\/:*?"<>|]/g, "");

  async function handlePng() {
    if (!pdf.blob || !ready || busy) return;
    setSavingImg(true);
    try {
      const { pdfToPng, downloadBlob } = await import("@/lib/resume/pdf");
      const blob = await pdfToPng(pdf.blob, quality === "high" ? 4 : 8 / 3);
      downloadBlob(blob, `${safeName()}_이력서.png`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setSavingImg(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between border-b bg-background px-5 py-3">
        <Button type="button" variant="ghost" onClick={onBack} disabled={busy}>
          <ChevronLeft size={18} /> 이전페이지
        </Button>
        <span className="hidden text-sm font-semibold text-foreground sm:block">
          PDF 미리보기
        </span>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {/* 품질 옵션 */}
          <Select disabled={busy} value={quality} onValueChange={(v) => setQuality(v as Quality)}>
            <SelectTrigger className="h-[38px]" aria-label="PNG 출력 품질">
              <SelectValue>{quality === "normal" ? "PNG 일반 화질" : "PNG 고화질"}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">일반 화질</SelectItem>
              <SelectItem value="high">고화질</SelectItem>
            </SelectContent>
          </Select>
          {/* PNG */}
          <Button type="button" variant="outline" onClick={handlePng} disabled={busy || !ready}>
            {savingImg ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ImageDown size={15} />
            )}
            <span className="hidden sm:inline">PNG</span>
          </Button>
          {/* PDF */}
          <Button
            type="button"
            disabled={!ready}
            onClick={() => {
              if (!pdf.url) return;
              const link = window.document.createElement("a");
              link.href = pdf.url;
              link.download = `${safeName()}_이력서.pdf`;
              link.click();
            }}
          >
            {pdf.loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {pdf.loading ? "생성 중…" : "PDF 다운로드"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-5 py-6 lg:flex-row">
        {/* 템플릿 선택 */}
        <aside className="w-full shrink-0 lg:w-72">
          <h2 className="text-lg font-bold">템플릿 선택</h2>
          <p className="mb-4 mt-1 text-sm text-muted-foreground">
            원하는 이력서 템플릿을 선택하세요.
          </p>
          <ul className="space-y-3">
            {TEMPLATES.map((tpl) => {
              const selected = tpl.id === templateId;
              return (
                <li key={tpl.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    disabled={busy}
                    onClick={() => onTemplateChange(tpl.id)}
                    className={`flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all ${
                      selected
                        ? "border-primary ring-1 ring-primary"
                        : "border-border hover:border-foreground/30"
                    }`}
                  >
                    <TemplateThumb id={tpl.id} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-foreground">{tpl.name}</span>
                        {selected && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                            <Check size={13} />
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {tpl.description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* 미리보기 영역 */}
        <div className="min-w-0 flex-1 overflow-auto rounded-2xl bg-muted p-4 sm:p-8">
          <p role="status" className="mb-4 text-sm text-muted-foreground">
            {pdf.error ? "PDF를 만들지 못했습니다. 내용을 수정하거나 템플릿을 다시 선택해 주세요."
              : ready ? "A4 PDF 미리보기" : "PDF를 만들고 있습니다…"}
          </p>
          {ready && pdf.url && (
            <iframe
              key={pdf.url}
              src={`${pdf.url}#toolbar=0&navpanes=0`}
              title="이력서 PDF 미리보기"
              data-pdf-template={ready ? templateId : undefined}
              className="mx-auto h-[80vh] min-h-[720px] w-full max-w-[850px] rounded bg-white shadow-xl ring-1 ring-black/5"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/** 좌측 템플릿 카드용 미니 썸네일 (CSS로만 표현) */
function TemplateThumb({ id }: { id: TemplateId }) {
  const base =
    "flex h-12 w-12 shrink-0 flex-col gap-[3px] overflow-hidden rounded-md border bg-white p-1.5";
  if (id === "professional") {
    return (
      <div className="flex h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-white">
        <div className="w-1/3 bg-[#1f2937]" />
        <div className="flex flex-1 flex-col gap-[3px] p-1.5">
          <div className="h-1 w-full rounded bg-neutral-300" />
          <div className="h-1 w-4/5 rounded bg-neutral-200" />
          <div className="h-1 w-full rounded bg-neutral-200" />
        </div>
      </div>
    );
  }
  if (id === "formal") {
    return (
      <div className={base}>
        <div className="grid flex-1 grid-cols-2 gap-[2px]">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[1px] border border-neutral-200" />
          ))}
        </div>
      </div>
    );
  }
  if (id === "modern") {
    return (
      <div className={base}>
        <div className="h-1.5 w-2/3 rounded bg-[#1e3a8a]" />
        <div className="ml-1 flex flex-1 flex-col gap-[3px] border-l-2 border-neutral-200 pl-1.5">
          <div className="h-1 w-full rounded bg-neutral-200" />
          <div className="h-1 w-3/4 rounded bg-neutral-200" />
        </div>
      </div>
    );
  }
  if (id === "simple") {
    return (
      <div className={`${base} justify-center gap-2`}>
        <div className="h-1.5 w-1/2 rounded bg-neutral-400" />
        <div className="h-1 w-full rounded bg-neutral-200" />
        <div className="h-1 w-2/3 rounded bg-neutral-200" />
      </div>
    );
  }
  // clean
  return (
    <div className={base}>
      <div className="h-1.5 w-1/2 rounded bg-neutral-400" />
      <div className="h-px w-full bg-neutral-200" />
      <div className="h-1 w-full rounded bg-neutral-200" />
      <div className="h-1 w-4/5 rounded bg-neutral-200" />
    </div>
  );
}
