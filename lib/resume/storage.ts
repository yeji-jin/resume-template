import type { ResumeData } from "./schema";
import type { TemplateId } from "./types";
import { emptyResume } from "./types";
import { STORAGE_KEY, uid } from "./utils";

/** 이력서 한 건(슬롯) */
export interface ResumeSlot {
  id: string;
  label: string; // 슬롯 이름 (예: 개발자용)
  data: ResumeData;
  templateId: TemplateId;
  savedAt: number;
}

export interface ResumeStore {
  version: 2;
  slots: ResumeSlot[];
  activeId: string;
}

const STORE_KEY = "resume-template.resume.store";

function freshSlot(label = "내 이력서"): ResumeSlot {
  return {
    id: uid("slot"),
    label,
    data: emptyResume,
    templateId: "clean",
    savedAt: 0,
  };
}

/** 저장소를 읽고, 없으면 구버전(STORAGE_KEY) 마이그레이션 또는 빈 슬롯 생성 */
export function loadStore(): ResumeStore {
  if (typeof window === "undefined") {
    const s = freshSlot();
    return { version: 2, slots: [s], activeId: s.id };
  }
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ResumeStore;
      if (parsed.slots?.length) {
        // 누락 필드 보정
        parsed.slots = parsed.slots.map((s) => ({
          ...s,
          data: { ...emptyResume, ...s.data },
        }));
        return parsed;
      }
    }
    // 구버전(단일 저장) 마이그레이션
    const legacy = localStorage.getItem(STORAGE_KEY);
    if (legacy) {
      const old = JSON.parse(legacy);
      const slot: ResumeSlot = {
        id: uid("slot"),
        label: old.data?.name ? `${old.data.name} 이력서` : "내 이력서",
        data: { ...emptyResume, ...old.data },
        templateId: old.templateId ?? "clean",
        savedAt: old.savedAt ?? Date.now(),
      };
      const store: ResumeStore = {
        version: 2,
        slots: [slot],
        activeId: slot.id,
      };
      saveStore(store);
      return store;
    }
  } catch {
    /* 무시하고 새 저장소 */
  }
  const s = freshSlot();
  return { version: 2, slots: [s], activeId: s.id };
}

/** 저장 성공 시 true, 용량 초과 등 실패 시 false */
export function saveStore(store: ResumeStore): boolean {
  if (typeof window === "undefined") return false;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return true;
  } catch {
    // QuotaExceededError 등 — 호출부에서 사용자 안내
    return false;
  }
}
