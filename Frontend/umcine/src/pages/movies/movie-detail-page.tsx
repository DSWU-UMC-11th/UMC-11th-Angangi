import { Link, useParams } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import { movies } from "../../data/movies";
import { cn } from "../../utils/cn";

const RATINGS = [1, 2, 3, 4, 5];

export function MovieDetailPage() {
  const { movieId } = useParams({ from: "/movies/$movieId" });
  const movie = movies.find((item) => item.id === Number(movieId));
  const [isBookmarked, setIsBookmarked] = useState(
    movie?.isBookmarked ?? false,
  );

  if (!movie) {
    return (
      <main className="page-container flex flex-1 flex-col items-start gap-3 pt-8 pb-20 text-(--color-text-secondary)">
        <p>영화를 찾을 수 없어요.</p>
        <Link className="text-(--color-action-primary) underline" to="/">
          영화 목록으로 돌아가기
        </Link>
      </main>
    );
  }

  const bookmarkIcon = isBookmarked
    ? "/icons/movie-icons/bookmark.svg"
    : "/icons/movie-icons/bookmark-outline.svg";

  return (
    <main className="flex-1 pb-20">
      {/* 상단 배경 영역 */}
      <section className="relative h-80 overflow-hidden bg-(--color-text-primary) text-(--color-bg-surface) min-[641px]:h-[408px]">
        <img
          className="absolute inset-0 size-full object-cover"
          src={movie.backdropPath}
          alt=""
          aria-hidden="true"
        />
        {/* 흰 글자가 배경 이미지 위에서도 읽히도록 왼쪽 아래를 어둡게 */}
        <div
          className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.6),transparent_60%),linear-gradient(to_right,rgba(0,0,0,0.45),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="page-container relative z-1 flex h-full flex-col justify-between pt-8 pb-7">
          <Link
            className="inline-flex items-center gap-1 self-start text-sm font-bold hover:underline"
            to="/"
          >
            {/* 검은색 아이콘을 흰색으로 표시 */}
            <img
              className="size-5 brightness-0 invert"
              src="/icons/movie-icons/chevron-left.svg"
              alt=""
            />
            영화 목록
          </Link>
          <div>
            <h1 className="text-[32px]/[1.2] font-extrabold tracking-[-0.03em] min-[641px]:text-5xl/[1.2]">
              {movie.title}
            </h1>
            <p className="mt-3 text-base">{movie.originalTitle}</p>
            <p className="mt-2 flex flex-wrap gap-x-2.5 gap-y-1 text-sm font-bold">
              <span>{movie.releaseDate}</span>
              <span>{movie.genres.join(" · ")}</span>
              <span>{movie.runtime}</span>
            </p>
          </div>
        </div>
      </section>

      {/* 하단 정보 영역 */}
      <div className="page-container grid grid-cols-1 items-start gap-6 pt-7 min-[641px]:grid-cols-[200px_minmax(0,1fr)] min-[641px]:gap-9 min-[1025px]:grid-cols-[226px_minmax(0,1fr)_406px]">
        <img
          className="aspect-226/323 w-40 rounded-lg object-cover shadow-[0_12px_24px_rgba(23,25,30,0.16)] min-[641px]:w-full"
          src={movie.posterPath}
          alt={`${movie.title} 포스터`}
        />

        <section>
          <h2 className="text-[22px] font-extrabold tracking-[-0.02em]">
            {movie.tagline}
          </h2>
          <p className="mt-4 text-[15px]/[1.8] text-(--color-text-secondary)">
            {movie.overview}
          </p>
          <button
            type="button"
            className="mt-4 inline-flex h-11 items-center gap-1.5 rounded-md bg-(--color-action-primary) px-[18px] text-[15px] font-bold text-(--color-bg-surface) hover:bg-(--color-action-hover) active:bg-(--color-action-pressed)"
            aria-pressed={isBookmarked}
            onClick={() => setIsBookmarked((current) => !current)}
          >
            <img className="size-5 brightness-0 invert" src={bookmarkIcon} alt="" />
            즐겨찾기
          </button>
        </section>

        <RatingForm />
      </div>
    </main>
  );
}

function RatingForm() {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSaved, setIsSaved] = useState(false);

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    // TODO: 서버 API가 생기면 평점 저장 요청 보내기
    setIsSaved(true);
  }

  return (
    <form
      className="col-span-full border-t border-(--color-border-default) pt-7 min-[1025px]:col-auto min-[1025px]:border-t-0 min-[1025px]:border-l min-[1025px]:pt-0 min-[1025px]:pl-[34px]"
      onSubmit={handleSubmit}
    >
      <h2 className="text-[22px] font-extrabold">내 평점</h2>
      <p className="mt-2 text-[13px] text-(--color-text-tertiary)">
        별점은 필수, 후기는 선택이에요.
      </p>

      <div className="mt-3 flex gap-[5px]" role="group" aria-label="별점">
        {RATINGS.map((value) => {
          const isSelected = value <= rating;

          return (
            <button
              key={value}
              type="button"
              className={cn(
                "flex size-[43px] items-center justify-center rounded-md border bg-(--color-bg-surface) p-0",
                isSelected
                  ? "border-(--color-text-primary)"
                  : "border-(--color-border-default) hover:border-(--color-text-tertiary)",
              )}
              aria-label={`${value}점`}
              aria-pressed={isSelected}
              onClick={() => {
                setRating(value);
                setIsSaved(false);
              }}
            >
              <img
                className="size-6"
                src={
                  isSelected
                    ? "/icons/movie-icons/star.svg"
                    : "/icons/movie-icons/star-outline.svg"
                }
                alt=""
              />
            </button>
          );
        })}
      </div>

      <textarea
        className="mt-2 block h-[116px] w-full resize-y rounded-lg border border-(--color-border-default) bg-(--color-bg-surface) p-3.5 text-sm text-(--color-text-primary) placeholder:text-(--color-text-tertiary) focus:outline-2 focus:-outline-offset-1 focus:outline-(--color-action-primary)"
        aria-label="후기"
        placeholder="영화를 보고 느낀 점을 남겨보세요."
        value={review}
        onChange={(event) => {
          setReview(event.target.value);
          setIsSaved(false);
        }}
      />

      <button
        type="submit"
        className="mt-2.5 h-[46px] w-full rounded-md bg-(--color-text-primary) text-[15px] font-bold text-(--color-bg-surface) disabled:cursor-not-allowed disabled:opacity-40"
        disabled={!rating}
      >
        평점 저장
      </button>
      {isSaved && (
        <p className="mt-2 text-[13px] text-(--color-action-primary)" role="status">
          평점을 저장했어요.
        </p>
      )}
    </form>
  );
}
