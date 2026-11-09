import Link from "next/link";
import { Suspense } from "react";
import HeaderAuthActions from "./header-auth-actions";
import HeaderNav from "./header-nav";
import HeaderNavLinks from "./header-nav-links";

export default function Header() {
  return (
    <header className="border-b border-(--color-border-default) bg-(--color-bg-surface)">
      <div className="page-container flex flex-wrap items-center gap-y-3 py-4 min-[481px]:h-[90px] min-[481px]:flex-nowrap min-[481px]:py-0">
        <Link
          className="flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.02em] text-(--color-text-primary) no-underline"
          href="/"
        >
          <span className="flex size-8 items-center justify-center rounded-lg border-2 border-(--color-text-primary)">
            <img className="size-5" src="/icons/movie-icons/movie.svg" alt="" />
          </span>
          UMCine
        </Link>

        <Suspense fallback={<HeaderNavLinks activeMenu={null} />}>
          <HeaderNav />
        </Suspense>

        <div className="ml-auto flex gap-3">
          <Link
            className="flex size-10 items-center justify-center rounded-lg border border-(--color-border-default) bg-(--color-bg-surface) hover:bg-(--color-bg-page)"
            href="/search"
            aria-label="검색"
          >
            <img src="/icons/movie-icons/search.svg" alt="" />
          </Link>
          <HeaderAuthActions />
        </div>
      </div>
    </header>
  );
}
