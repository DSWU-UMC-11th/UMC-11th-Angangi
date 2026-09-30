import { Link, useLocation } from "@tanstack/react-router";
import "./header.css";

export default function Header() {
  const pathname = useLocation({ select: (location) => location.pathname });
  // 영화 상세(/movies/...)에서도 "영화" 메뉴를 활성화해요
  const isMoviesActive = pathname === "/" || pathname.startsWith("/movies/");

  return (
    <header className="header">
      <div className="container header__inner">
        <Link className="header__logo" to="/">
          <span className="header__logo-icon">
            <img src="/icons/movie-icons/movie.svg" alt="" />
          </span>
          UMCine
        </Link>

        <nav className="header__nav" aria-label="주요 메뉴">
          {/* 활성화된 Link에는 aria-current="page"가 자동으로 붙어요 */}
          <Link
            className="header__nav-link"
            to="/"
            activeOptions={{ exact: true }}
            aria-current={isMoviesActive ? "page" : undefined}
          >
            영화
          </Link>
          <Link className="header__nav-link" to="/search">
            검색
          </Link>
          {/* TODO: /my 라우트를 만든 뒤 Link로 바꾸기 */}
          <a className="header__nav-link" href="/my">
            내 정보
          </a>
        </nav>

        <div className="header__actions">
          <Link className="header__search" to="/search" aria-label="검색">
            <img src="/icons/movie-icons/search.svg" alt="" />
          </Link>
          <button type="button" className="header__login">
            로그인
          </button>
        </div>
      </div>
    </header>
  );
}
