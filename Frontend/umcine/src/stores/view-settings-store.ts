import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type MovieSortOrder = "default" | "latest" | "title";

interface ViewSettingsStore {
  sortOrder: MovieSortOrder;
  setSortOrder: (sortOrder: MovieSortOrder) => void;
}

export const useViewSettingsStore = create<ViewSettingsStore>()(
  persist(
    (set) => ({
      sortOrder: "default",
      setSortOrder: (sortOrder) => set({ sortOrder }),
    }),
    {
      name: "umcine-view-settings",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (state) => ({ sortOrder: state.sortOrder }),
    },
  ),
);
