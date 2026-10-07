import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type MovieSortOrder = "default" | "latest" | "title";

interface ViewSettingsStore {
  sortOrder: MovieSortOrder;
  setSortOrder: (sortOrder: MovieSortOrder) => void;
}

// 서버에 보낼 필요 없이 이 브라우저에서만 기억하면 되는 화면 설정이에요
export const useViewSettingsStore = create<ViewSettingsStore>()(
  persist(
    (set) => ({
      sortOrder: "default",
      setSortOrder: (sortOrder) => set({ sortOrder }),
    }),
    {
      name: "umcine-view-settings",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ sortOrder: state.sortOrder }),
    },
  ),
);
