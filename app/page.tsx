"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Eye,
  RotateCcw,
  FileText,
  Cloud,
  Loader2,
  Download,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ThemeToggle } from "@/components/theme-toggle";
import ResumeForm from "@/components/resume/ResumeForm";
import ResumePreview from "@/components/resume/ResumePreview";
import SlotBar from "@/components/resume/SlotBar";
import { emptyResume, sampleResume, type ResumeData, type TemplateId } from "@/lib/resume/types";
import { resumeDataSchema } from "@/lib/resume/schema";
import { normalizeResume, uid } from "@/lib/resume/utils";
import { useResumeStore } from "@/hooks/useResumeStore";
import type { ResumeSlot } from "@/lib/resume/storage";

type Step = "form" | "preview";

export default function ResumePage() {
  const { store, isLoading, updateStore, saveMutation } = useResumeStore();
  const [step, setStep] = useState<Step>("form");
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const importRef = useRef<HTMLInputElement>(null);

  const activeIdRef = useRef<string | undefined>(undefined);
  const lastActiveIdRef = useRef<string | null>(null);
  const skipNextSave = useRef(true); // 하이드레이션 직후 1회 자동저장 스킵

  const form = useForm<ResumeData>({
    resolver: zodResolver(resumeDataSchema),
    defaultValues: emptyResume,
    mode: "onBlur",
  });

  const active: ResumeSlot | null =
    store?.slots.find((s) => s.id === store.activeId) ?? null;

  // 슬롯 전환 시(최초 로드 포함) 폼을 해당 슬롯 데이터로 리셋
  useEffect(() => {
    if (!store) return;
    activeIdRef.current = store.activeId;
    const slot = store.slots.find((s) => s.id === store.activeId);
    if (!slot) return;
    if (lastActiveIdRef.current !== store.activeId) {
      form.reset(slot.data);
      lastActiveIdRef.current = store.activeId;
      setSavedAt(slot.savedAt || null);
    }
  }, [store, form]);

  // 폼 입력 → 저장소(활성 슬롯) 실시간 동기화
  useEffect(() => {
    const subscription = form.watch((values) => {
      const id = activeIdRef.current;
      if (!id) return;
      updateStore((prev) => ({
        ...prev,
        slots: prev.slots.map((s) =>
          s.id === id ? { ...s, data: values as ResumeData } : s
        ),
      }));
    });
    return () => subscription.unsubscribe();
  }, [form, updateStore]);

  // 자동 저장 (debounce 800ms)
  useEffect(() => {
    if (!store) return;
    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }
    setSaving(true);
    const t = setTimeout(() => {
      const now = Date.now();
      const persisted = {
        ...store,
        slots: store.slots.map((s) =>
          s.id === store.activeId ? { ...s, savedAt: now } : s
        ),
      };
      saveMutation.mutate(persisted, {
        onSuccess: () => {
          setSaving(false);
          setSavedAt(now);
        },
        onError: () => {
          setSaving(false);
          toast.error("저장 용량이 부족합니다. 사진을 줄이거나 이력서를 정리해 주세요.");
        },
      });
    }, 800);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store]);

  /* ── 템플릿 변경 ── */
  function setTemplateId(templateId: TemplateId) {
    updateStore((prev) => ({
      ...prev,
      slots: prev.slots.map((s) =>
        s.id === prev.activeId ? { ...s, templateId } : s
      ),
    }));
  }

  /* ── 슬롯 관리 ── */
  function addSlot() {
    const slot: ResumeSlot = {
      id: uid("slot"),
      label: `이력서 ${(store?.slots.length ?? 0) + 1}`,
      data: emptyResume,
      templateId: "clean",
      savedAt: Date.now(),
    };
    updateStore((prev) => ({
      ...prev,
      slots: [...prev.slots, slot],
      activeId: slot.id,
    }));
    toast.success("새 이력서를 추가했습니다.");
  }
  function selectSlot(id: string) {
    updateStore((prev) => ({ ...prev, activeId: id }));
  }
  function renameSlot(id: string, label: string) {
    updateStore((prev) => ({
      ...prev,
      slots: prev.slots.map((s) => (s.id === id ? { ...s, label: label || "이력서" } : s)),
    }));
  }
  function deleteSlot(id: string) {
    updateStore((prev) => {
      if (prev.slots.length <= 1) return prev; // 최소 1개 유지
      const slots = prev.slots.filter((s) => s.id !== id);
      const activeId = prev.activeId === id ? slots[0].id : prev.activeId;
      return { ...prev, slots, activeId };
    });
    toast.success("이력서를 삭제했습니다.");
  }

  /* ── 보조 동작 ── */
  function handleReset() {
    form.reset(emptyResume);
    setResetDialogOpen(false);
    toast.success("초기화되었습니다.");
  }
  function handleSample() {
    form.reset(sampleResume);
    toast.success("샘플 데이터를 불러왔습니다.");
  }
  function handleExport() {
    const data = form.getValues();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${data.name || "resume"}_이력서.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("JSON 파일을 내보냈습니다.");
  }
  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        form.reset(normalizeResume(parsed));
        toast.success("JSON 파일을 불러왔습니다.");
      } catch {
        toast.error("올바른 이력서 JSON 파일이 아닙니다.");
      }
    };
    reader.readAsText(file);
  }

  /* ── 필수값 검증 후 미리보기 이동 ── */
  async function goPreview() {
    const ok = await form.trigger(["name", "phone"]);
    if (!ok) {
      toast.error("이름과 연락처는 필수 입력 항목입니다.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setStep("preview");
  }

  // 로딩 (하이드레이션 전)
  if (isLoading || !store || !active) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  if (step === "preview") {
    return (
      <ResumePreview
        data={active.data}
        templateId={active.templateId}
        onTemplateChange={setTemplateId}
        onBack={() => setStep("form")}
      />
    );
  }

  return (
    <FormProvider {...form}>
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        {/* 헤더 */}
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold">
              <FileText className="text-primary" size={24} />
              이력서 작성
            </h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
              필드를 채우고 템플릿을 골라 PDF로 내보내세요.
              <SaveIndicator saving={saving} savedAt={savedAt} />
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* 이력서 슬롯 */}
        <SlotBar
          slots={store.slots}
          activeId={store.activeId}
          onSelect={selectSlot}
          onAdd={addSlot}
          onRename={renameSlot}
          onDelete={deleteSlot}
        />

        {/* 액션 바 */}
        <div className="sticky top-14 z-10 mb-6 mt-4 flex flex-wrap items-center gap-2 rounded-xl border bg-background/90 p-2 backdrop-blur">
          <Button type="button" variant="outline" onClick={handleSample}>
            샘플
          </Button>
          <Button type="button" variant="outline" onClick={handleExport}>
            <Download size={15} /> JSON 내보내기
          </Button>
          <Button type="button" variant="outline" onClick={() => importRef.current?.click()}>
            <Upload size={15} /> 가져오기
          </Button>
          <input
            ref={importRef}
            type="file"
            accept="application/json"
            onChange={handleImportFile}
            className="hidden"
          />
          <Button type="button" variant="outline" onClick={() => setResetDialogOpen(true)}>
            <RotateCcw size={15} /> 초기화
          </Button>
          <Button type="button" onClick={goPreview} className="ml-auto">
            <Eye size={16} /> 미리보기 / PDF
          </Button>
        </div>

        <ResumeForm />

        <div className="mt-10 flex justify-end">
          <Button type="button" onClick={goPreview}>
            <Eye size={16} /> 미리보기로 이동
          </Button>
        </div>

        <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>이력서를 초기화할까요?</AlertDialogTitle>
              <AlertDialogDescription>
                현재 이력서 내용을 모두 초기화합니다. 이 작업은 되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction variant="destructive" onClick={handleReset}>
                초기화
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </FormProvider>
  );
}

function SaveIndicator({ saving, savedAt }: { saving: boolean; savedAt: number | null }) {
  if (saving) {
    return (
      <span className="ml-1 inline-flex items-center gap-1 text-muted-foreground">
        <Loader2 size={13} className="animate-spin" /> 저장 중…
      </span>
    );
  }
  if (savedAt) {
    return (
      <span className="ml-1 inline-flex items-center gap-1 text-success">
        <Cloud size={13} /> 자동 저장됨
      </span>
    );
  }
  return null;
}
