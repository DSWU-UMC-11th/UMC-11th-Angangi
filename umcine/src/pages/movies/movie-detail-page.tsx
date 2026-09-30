import { Link, useParams } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import { movies } from "../../data/movies";
import "./movie-detail-page.css";

const RATINGS = [1, 2, 3, 4, 5];

export function MovieDetailPage() {
  const { movieId } = useParams({ from: "/movies/$movieId" });
  const movie = movies.find((item) => item.id === Number(movieId));
  const [isBookmarked, setIsBookmarked] = useState(
    movie?.isBookmarked ?? false,
  );

  if (!movie) {
    return (
      <main className="movie-detail movie-detail--empty container">
        <p>영화를 찾을 수 없어요.</p>
        <Link to="/">영화 목록으로 돌아가기</Link>
      </main>
    );
  }

  const bookmarkIcon = isBookmarked
    ? "/icons/movie-icons/bookmark.svg"
    : "/icons/movie-icons/bookmark-outline.svg";

  return (
    <main className="movie-detail">
      <section className="movie-detail__hero">
        <img
          className="movie-detail__backdrop"
          src={movie.backdropPath}
          alt=""
          aria-hidden="true"
        />
        <div className="container movie-detail__hero-inner">
          <Link className="movie-detail__back" to="/">
            <img src="/icons/movie-icons/chevron-left.svg" alt="" />
            영화 목록
          </Link>
          <div className="movie-detail__heading">
            <h1 className="movie-detail__title">{movie.title}</h1>
            <p className="movie-detail__original-title">
              {movie.originalTitle}
            </p>
            <p className="movie-detail__meta">
              <span>{movie.releaseDate}</span>
              <span>{movie.genres.join(" · ")}</span>
              <span>{movie.runtime}</span>
            </p>
          </div>
        </div>
      </section>

      <div className="container movie-detail__body">
        <img
          className="movie-detail__poster"
          src={movie.posterPath}
          alt={`${movie.title} 포스터`}
        />

        <section className="movie-detail__info">
          <h2 className="movie-detail__tagline">{movie.tagline}</h2>
          <p className="movie-detail__overview">{movie.overview}</p>
          <button
            type="button"
            className="movie-detail__bookmark"
            aria-pressed={isBookmarked}
            onClick={() => setIsBookmarked((current) => !current)}
          >
            <img src={bookmarkIcon} alt="" />
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
    <form className="rating-form" onSubmit={handleSubmit}>
      <h2 className="rating-form__title">내 평점</h2>
      <p className="rating-form__hint">별점은 필수, 후기는 선택이에요.</p>

      <div className="rating-form__stars" role="group" aria-label="별점">
        {RATINGS.map((value) => (
          <button
            key={value}
            type="button"
            className="rating-form__star"
            aria-label={`${value}점`}
            aria-pressed={value <= rating}
            onClick={() => {
              setRating(value);
              setIsSaved(false);
            }}
          >
            <img
              src={
                value <= rating
                  ? "/icons/movie-icons/star.svg"
                  : "/icons/movie-icons/star-outline.svg"
              }
              alt=""
            />
          </button>
        ))}
      </div>

      <textarea
        className="rating-form__review"
        aria-label="후기"
        placeholder="영화를 보고 느낀 점을 남겨보세요."
        value={review}
        onChange={(event) => {
          setReview(event.target.value);
          setIsSaved(false);
        }}
      />

      <button type="submit" className="rating-form__submit" disabled={!rating}>
        평점 저장
      </button>
      {isSaved && (
        <p className="rating-form__saved" role="status">
          평점을 저장했어요.
        </p>
      )}
    </form>
  );
}
