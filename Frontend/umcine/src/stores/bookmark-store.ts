import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface BookmarkStore {
  bookmarkedMovieIds: number[];
  toggleBookmark: (movieId: number) => void;
}

export const useBookmarkStore = create<BookmarkStore>()(
  // 북마크한 영화 ID를 localStorage에 저장하고 앱을 다시 열 때 복원해요
  persist(
    (set) => ({
      bookmarkedMovieIds: [],
      toggleBookmark: (movieId) =>
        set((state) => ({
          bookmarkedMovieIds: state.bookmarkedMovieIds.includes(movieId)
            ? state.bookmarkedMovieIds.filter((id) => id !== movieId)
            : [...state.bookmarkedMovieIds, movieId],
        })),
    }),
    {
      name: "umcine-bookmark-store",
      storage: createJSONStorage(() => localStorage),
      // 함수(action)는 저장할 수 없으니 ID 배열만 저장해요
      partialize: (state) => ({ bookmarkedMovieIds: state.bookmarkedMovieIds }),
    },
  ),
);
