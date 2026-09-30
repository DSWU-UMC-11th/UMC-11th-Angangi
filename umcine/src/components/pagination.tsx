import { cn } from "../utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const buttonClassName =
  "flex size-9 items-center justify-center rounded-md border border-(--color-border-default) bg-(--color-bg-surface) p-0 text-sm font-semibold text-(--color-text-secondary)";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const arrowClassName = cn(
    buttonClassName,
    "enabled:hover:border-(--color-text-tertiary) disabled:opacity-40",
  );

  return (
    <nav className="mt-12 flex justify-center gap-2" aria-label="페이지 이동">
      <button
        type="button"
        className={arrowClassName}
        aria-label="이전 페이지"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <img src="/icons/movie-icons/chevron-left.svg" alt="" />
      </button>

      {pages.map((page) => {
        const isCurrent = page === currentPage;

        return (
          <button
            key={page}
            type="button"
            className={cn(
              buttonClassName,
              isCurrent
                ? "border-(--color-action-primary) bg-(--color-action-primary) text-(--color-bg-surface)"
                : "hover:border-(--color-text-tertiary)",
            )}
            aria-current={isCurrent ? "page" : undefined}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        className={arrowClassName}
        aria-label="다음 페이지"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <img src="/icons/movie-icons/chevron-right.svg" alt="" />
      </button>
    </nav>
  );
}
