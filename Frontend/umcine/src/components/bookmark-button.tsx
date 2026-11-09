import { useLocation, useNavigate } from "@tanstack/react-router";
import { useToggleFavoriteMutation } from "../hooks/use-toggle-favorite-mutation";
import { useAuthStore } from "../stores/auth-store";
import { cn } from "../utils/cn";

interface BookmarkButtonProps {
  movieId: number;
  movieTitle: string;
  isFavorite: boolean;
  variant?: "icon" | "label";
  className?: string;
}

export function BookmarkButton({
  movieId,
  movieTitle,
  isFavorite,
  variant = "icon",
  className,
}: BookmarkButtonProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const navigate = useNavigate();
  const location = useLocation();
  const toggleFavoriteMutation = useToggleFavoriteMutation();
  const isPending = toggleFavoriteMutation.isPending;

  const handleClick = () => {
    if (!accessToken) {
      if (confirm("즐겨찾기는 로그인 후 이용할 수 있어요. 로그인할까요?")) {
        navigate({ to: "/login", search: { redirect: location.href } });
      }
      return;
    }
    if (isPending) return;
    toggleFavoriteMutation.mutate({ movieId, isFavorite });
  };

  const bookmarkIcon = isFavorite
    ? "/icons/movie-icons/bookmark.svg"
    : "/icons/movie-icons/bookmark-outline.svg";

  if (variant === "label") {
    return (
      <button
        type="button"
        className={cn(
          "inline-flex h-11 items-center gap-1.5 rounded-md bg-(--color-action-primary) px-[18px] text-[15px] font-bold text-(--color-bg-surface) hover:bg-(--color-action-hover) active:bg-(--color-action-pressed) disabled:cursor-wait disabled:opacity-60",
          className,
        )}
        aria-pressed={isFavorite}
        disabled={isPending}
        onClick={handleClick}
      >
        <img className="size-5 brightness-0 invert" src={bookmarkIcon} alt="" />
        {isFavorite ? "즐겨찾기 해제" : "즐겨찾기"}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        "flex size-7 items-center justify-center rounded-md border-[1.5px] p-0 disabled:cursor-wait disabled:opacity-60 sm:size-8",
        isFavorite
          ? "border-(--color-action-primary) bg-(--color-action-primary) hover:border-(--color-action-hover) hover:bg-(--color-action-hover)"
          : "border-(--color-bg-surface) bg-[rgba(23,25,30,0.72)] hover:bg-(--color-text-primary)",
        className,
      )}
      aria-pressed={isFavorite}
      aria-label={`${movieTitle} 즐겨찾기`}
      disabled={isPending}
      onClick={handleClick}
    >
      <img
        className="size-5 brightness-0 invert sm:size-[22px]"
        src={bookmarkIcon}
        alt=""
      />
    </button>
  );
}
