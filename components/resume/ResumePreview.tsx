"use client";

import { useRef, useState } from "react";
import { ChevronLeft, Check, Download, Loader2, ImageDown } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ResumeData, TemplateId } from "@/lib/resume/types";
import { TEMPLATES } from "@/lib/resume/types";
import { PAGE_WIDTH, ResumeTemplate } from "@/lib/resume/templates";

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
  const sheetRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [savingImg, setSavingImg] = useState(false);
  const [quality, setQuality] = useState<Quality>("normal");

  const safeName = () => (data.name || "resume").replace(/[\\/:*?"<>|]/g, "");

  async function capture() {
    const { default: html2canvas } = await import("html2canvas");
    return html2canvas(sheetRef.current as HTMLElement, {
      scale: quality === "high" ? 3 : 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: PAGE_WIDTH,
    });
  }

  async function handleDownload() {
    if (!sheetRef.current || downloading) return;
    setDownloading(true);
    try {
      const [canvas, { jsPDF }] = await Promise.all([
        capture(),
        import("jspdf").then((m) => m),
      ]);

      const pdf = new jsPDF("p", "mm", "a4");
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const imgH = (canvas.height * pageW) / canvas.width;

      let remaining = imgH;
      let position = 0;
      const imgData = canvas.toDataURL("image/jpeg", 0.98);

      pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH);
      remaining -= pageH;

      // 한 페이지를 넘기면 같은 이미지를 음수 오프셋으로 이어 붙여 페이지 분할
      while (remaining > 0) {
        position -= pageH;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, pageW, imgH);
        remaining -= pageH;
      }

      pdf.save(`${safeName()}_이력서.pdf`);
    } catch (err) {
      console.error(err);
      toast.error("PDF 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setDownloading(false);
    }
  }

  async function handlePng() {
    if (!sheetRef.current || savingImg) return;
    setSavingImg(true);
    try {
      const canvas = await capture();
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeName()}_이력서.png`;
      a.click();
    } catch (err) {
      console.error(err);
      toast.error("이미지 저장 중 오류가 발생했습니다.");
    } finally {
      setSavingImg(false);
    }
  }

  return (
    <div className="flex flex-col">
      {/* 상단 툴바 */}
      <div className="flex items-center justify-between border-b bg-background px-5 py-3">
        <Button type="button" variant="ghost" onClick={onBack}>
          <ChevronLeft size={18} /> 이전페이지
        </Button>
        <span className="hidden text-sm font-semibold text-foreground sm:block">
          PDF 미리보기
        </span>
        <div className="flex items-center gap-2">
          {/* 품질 옵션 */}
          <Select value={quality} onValueChange={(v) => setQuality(v as Quality)}>
            <SelectTrigger className="h-[38px]" aria-label="출력 품질">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="normal">일반 화질</SelectItem>
              <SelectItem value="high">고화질</SelectItem>
            </SelectContent>
          </Select>
          {/* PNG */}
          <Button type="button" variant="outline" onClick={handlePng} disabled={savingImg}>
            {savingImg ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ImageDown size={15} />
            )}
            <span className="hidden sm:inline">PNG</span>
          </Button>
          {/* PDF */}
          <Button type="button" onClick={handleDownload} disabled={downloading}>
            {downloading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} />
            )}
            {downloading ? "생성 중…" : "PDF 다운로드"}
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
        <div className="flex-1 overflow-auto rounded-2xl bg-muted p-4 sm:p-8">
          <div className="mx-auto w-fit shadow-xl ring-1 ring-black/5">
            <div ref={sheetRef}>
              <ResumeTemplate templateId={templateId} data={data} />
            </div>
          </div>
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
