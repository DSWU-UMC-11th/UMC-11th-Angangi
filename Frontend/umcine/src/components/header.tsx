import { useQuery } from "@tanstack/react-query";
import { Link, useMatchRoute } from "@tanstack/react-router";
import { memberQueries } from "../api/members/member-queries";
import { useAuthStore } from "../stores/auth-store";
import { cn } from "../utils/cn";

const navLinkClassName =
  "text-sm font-medium text-(--color-text-secondary) no-underline hover:text-(--color-text-primary)";
const primaryLinkClassName =
  "flex h-10 items-center rounded-md bg-(--color-action-primary) px-4 text-sm font-bold text-(--color-bg-surface) no-underline hover:bg-(--color-action-hover) active:bg-(--color-action-pressed)";
const activeNavLinkClassName =
  "font-bold text-(--color-text-primary) underline decoration-[1.5px] underline-offset-[6px] hover:text-(--color-text-primary)";

export default function Header() {
  const matchRoute = useMatchRoute();
  // 영화 상세(/movies/$movieId)에서도 "영화" 메뉴를 활성화해요
  const isMoviesActive = Boolean(
    matchRoute({ to: "/" }) || matchRoute({ to: "/movies/$movieId" }),
  );
  const isSearchActive = Boolean(matchRoute({ to: "/search" }));
  // /my/edit, /my/ratings에서도 "내 정보" 메뉴를 활성화해요
  const isMyActive = Boolean(matchRoute({ to: "/my", fuzzy: true }));

  const accessToken = useAuthStore((state) => state.accessToken);
  // 토큰이 있을 때만 조회해요. 토큰이 유효한지는 이 요청의 응답(401)으로 확인해요
  const meQuery = useQuery({
    ...memberQueries.me(),
    enabled: Boolean(accessToken),
  });

  return (
    <header className="border-b border-(--color-border-default) bg-(--color-bg-surface)">
      <div className="page-container flex flex-wrap items-center gap-y-3 py-4 min-[481px]:h-[90px] min-[481px]:flex-nowrap min-[481px]:py-0">
        <Link
          className="flex items-center gap-2.5 text-xl font-extrabold tracking-[-0.02em] text-(--color-text-primary) no-underline"
          to="/"
          // 기본값(fuzzy)이면 "/"가 모든 경로에서 활성으로 판정돼요
          activeOptions={{ exact: true }}
        >
          <span className="flex size-8 items-center justify-center rounded-lg border-2 border-(--color-text-primary)">
            <img className="size-5" src="/icons/movie-icons/movie.svg" alt="" />
          </span>
          UMCine
        </Link>

        <nav
          className="order-1 flex w-full gap-[30px] min-[481px]:order-none min-[481px]:ml-11 min-[481px]:w-auto"
          aria-label="주요 메뉴"
        >
          <NavLink to="/" isActive={isMoviesActive}>
            영화
          </NavLink>
          <NavLink to="/search" isActive={isSearchActive}>
            검색
          </NavLink>
          <NavLink to="/my" isActive={isMyActive}>
            내 정보
          </NavLink>
        </nav>

        <div className="ml-auto flex gap-3">
          <Link
            className="flex size-10 items-center justify-center rounded-lg border border-(--color-border-default) bg-(--color-bg-surface) hover:bg-(--color-bg-page)"
            to="/search"
            aria-label="검색"
          >
            <img src="/icons/movie-icons/search.svg" alt="" />
          </Link>
          {!accessToken ? (
            <>
              <Link
                className="flex h-10 items-center rounded-md border border-(--color-border-default) bg-(--color-bg-surface) px-4 text-sm font-bold text-(--color-text-primary) no-underline hover:bg-(--color-bg-page)"
                to="/signup"
              >
                회원가입
              </Link>
              <Link className={primaryLinkClassName} to="/login">
                로그인
              </Link>
            </>
          ) : meQuery.isLoading ? (
            // enabled가 꺼져 있어도 isPending은 참이라, 실제 첫 요청 중인지는 isLoading으로 봐요
            <span
              className="h-10 w-24 animate-pulse rounded-md bg-(--color-border-default)"
              aria-label="내 정보를 불러오는 중"
            />
          ) : (
            <Link className={primaryLinkClassName} to="/my">
              마이페이지
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

interface NavLinkProps {
  to: "/" | "/search" | "/my";
  isActive: boolean;
  children: string;
}

// Link는 자기 기준으로 활성이면 aria-current="page"를 강제로 붙여요.
// exact로 판정 범위를 좁혀 isActive와 어긋나지 않게 해요.
function NavLink({ to, isActive, children }: NavLinkProps) {
  return (
    <Link
      className={cn(navLinkClassName, isActive && activeNavLinkClassName)}
      to={to}
      activeOptions={{ exact: true }}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </Link>
  );
}
