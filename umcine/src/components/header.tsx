import "./header.css";

const navItems = [
  { label: "영화", href: "/", isActive: true },
  { label: "검색", href: "/search", isActive: false },
  { label: "내 정보", href: "/my", isActive: false },
];

export default function Header() {
  return (
    <header className="header">
      <div className="container header__inner">
        <a className="header__logo" href="/">
          <span className="header__logo-icon">
            <img src="/icons/movie-icons/movie.svg" alt="" />
          </span>
          UMCine
        </a>

        <nav className="header__nav" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <a
              key={item.href}
              className="header__nav-link"
              href={item.href}
              aria-current={item.isActive ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="header__actions">
          <button type="button" className="header__search" aria-label="검색">
            <img src="/icons/movie-icons/search.svg" alt="" />
          </button>
          <button type="button" className="header__login">
            로그인
          </button>
        </div>
      </div>
    </header>
  );
}
