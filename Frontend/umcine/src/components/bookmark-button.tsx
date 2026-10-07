import { useBookmarkStore } from "../stores/bookmark-store";
import { cn } from "../utils/cn";

interface BookmarkButtonProps {
  movieId: number;
  movieTitle: string;
  // icon: 포스터 위에 올리는 아이콘 버튼, label: 상세 화면의 "즐겨찾기" 버튼
  variant?: "icon" | "label";
  className?: string;
}

export function BookmarkButton({
  movieId,
  movieTitle,
  variant = "icon",
  className,
}: BookmarkButtonProps) {
  const isBookmarked = useBookmarkStore((state) =>
    state.bookmarkedMovieIds.includes(movieId),
  );
  const toggleBookmark = useBookmarkStore((state) => state.toggleBookmark);

  const bookmarkIcon = isBookmarked
    ? "/icons/movie-icons/bookmark.svg"
    : "/icons/movie-icons/bookmark-outline.svg";

  if (variant === "label") {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex h-11 items-center gap-1.5 rounded-md bg-(--color-action-primary) px-[18px] text-[15px] font-bold text-(--color-bg-surface) hover:bg-(--color-action-hover) active:bg-(--color-action-pressed)",
          className,
        )}
        aria-pressed={isBookmarked}
        onClick={() => toggleBookmark(movieId)}
      >
        <img className="size-5 brightness-0 invert" src={bookmarkIcon} alt="" />
        즐겨찾기
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "flex size-7 items-center justify-center rounded-md border-[1.5px] p-0 sm:size-8",
        isBookmarked
          ? "border-(--color-action-primary) bg-(--color-action-primary) hover:border-(--color-action-hover) hover:bg-(--color-action-hover)"
          : "border-(--color-bg-surface) bg-[rgba(23,25,30,0.72)] hover:bg-(--color-text-primary)",
        className,
      )}
      aria-pressed={isBookmarked}
      aria-label={`${movieTitle} 북마크`}
      onClick={() => toggleBookmark(movieId)}
    >
      <img
        className="size-5 brightness-0 invert sm:size-[22px]"
        src={bookmarkIcon}
        alt=""
      />
    </button>
  );
}
