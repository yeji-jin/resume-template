"use client";

import { useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loadStore, saveStore, type ResumeStore } from "@/lib/resume/storage";

export const RESUME_STORE_QUERY_KEY = ["resume-store"] as const;

/**
 * localStorage 기반 이력서 저장소를 react-query로 래핑한다.
 * - useQuery: 최초 진입 시 저장소 로드(구버전 마이그레이션 포함)
 * - useMutation: debounce된 자동 저장 (localStorage.setItem)
 * 실제 서버 통신은 없지만, 로딩/저장 상태와 캐시를 react-query로 일원화한다.
 */
export function useResumeStore() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: RESUME_STORE_QUERY_KEY,
    queryFn: loadStore,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });

  const saveMutation = useMutation({
    mutationFn: async (store: ResumeStore) => {
      const ok = saveStore(store);
      if (!ok) throw new Error("STORAGE_FULL");
      return store;
    },
  });

  const updateStore = useCallback(
    (updater: (prev: ResumeStore) => ResumeStore) => {
      queryClient.setQueryData<ResumeStore>(RESUME_STORE_QUERY_KEY, (prev) =>
        prev ? updater(prev) : prev
      );
    },
    [queryClient]
  );

  return {
    store: query.data,
    isLoading: query.isLoading,
    updateStore,
    saveMutation,
  };
}
