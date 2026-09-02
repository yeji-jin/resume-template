"use client";

import { useEffect, useRef, useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { ResumeSlot } from "@/lib/resume/storage";

interface Props {
  slots: ResumeSlot[];
  activeId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => void;
}

export default function SlotBar({
  slots,
  activeId,
  onSelect,
  onAdd,
  onRename,
  onDelete,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ResumeSlot | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingId) inputRef.current?.focus();
  }, [editingId]);

  function startEdit(slot: ResumeSlot) {
    setEditingId(slot.id);
    setDraft(slot.label);
  }
  function commit() {
    if (editingId) onRename(editingId, draft.trim());
    setEditingId(null);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {slots.map((slot) => {
        const isActive = slot.id === activeId;
        const isEditing = slot.id === editingId;
        return (
          <div
            key={slot.id}
            className={`group flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
              isActive
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:border-foreground/30"
            }`}
          >
            {isEditing ? (
              <>
                <Input
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commit();
                    if (e.key === "Escape") setEditingId(null);
                  }}
                  className="h-6 w-24 border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={commit}
                  className="text-success hover:text-success"
                  aria-label="확인"
                >
                  <Check size={14} />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setEditingId(null)}
                  className="text-muted-foreground"
                  aria-label="취소"
                >
                  <X size={14} />
                </Button>
              </>
            ) : (
              <>
                <button type="button" onClick={() => onSelect(slot.id)} className="font-medium">
                  {slot.label}
                </button>
                {isActive && (
                  <>
                    <button
                      type="button"
                      onClick={() => startEdit(slot)}
                      className="text-primary/70 hover:text-primary"
                      aria-label="이름 변경"
                    >
                      <Pencil size={13} />
                    </button>
                    {slots.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(slot)}
                        className="text-primary/70 hover:text-destructive"
                        aria-label="삭제"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        );
      })}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAdd}
        className="border-dashed text-muted-foreground"
      >
        <Plus size={15} /> 새 이력서
      </Button>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>이력서를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              &apos;{deleteTarget?.label}&apos; 이력서를 삭제합니다. 이 작업은 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => {
                if (deleteTarget) onDelete(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
