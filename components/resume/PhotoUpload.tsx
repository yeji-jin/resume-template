"use client";

import { useRef } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function PhotoUpload({ value, onChange }: Props) {
  const ref = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일을 선택해 주세요.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        // 최대 400px로 축소해 localStorage 용량 절감
        const MAX = 400;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          onChange(String(reader.result));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        onChange(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => alert("이미지를 불러올 수 없습니다.");
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-32 w-24 overflow-hidden rounded-lg border bg-muted">
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="프로필 사진" className="h-full w-full object-cover" />
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={() => onChange("")}
              className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/50 text-white hover:bg-black/60 hover:text-white"
              aria-label="사진 삭제"
            >
              <X size={13} />
            </Button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => ref.current?.click()}
            className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground transition-colors hover:text-primary"
          >
            <ImagePlus size={22} />
            <span className="text-xs">사진 등록</span>
          </button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}
