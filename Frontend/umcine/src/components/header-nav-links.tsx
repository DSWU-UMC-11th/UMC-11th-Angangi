import Link from "next/link";
import { cn } from "../utils/cn";

export type HeaderMenu = "movies" | "search" | "my";

const MENUS: { menu: HeaderMenu; href: string; label: string }[] = [
  { menu: "movies", href: "/", label: "영화" },
  { menu: "search", href: "/search", label: "검색" },
  { menu: "my", href: "/my", label: "내 정보" },
];

const navLinkClassName =
  "text-sm font-medium text-(--color-text-secondary) no-underline hover:text-(--color-text-primary)";
const activeNavLinkClassName =
  "font-bold text-(--color-text-primary) underline decoration-[1.5px] underline-offset-[6px] hover:text-(--color-text-primary)";

interface HeaderNavLinksProps {
  activeMenu: HeaderMenu | null;
}

export default function HeaderNavLinks({ activeMenu }: HeaderNavLinksProps) {
  return (
    <nav
      className="order-1 flex w-full gap-[30px] min-[481px]:order-none min-[481px]:ml-11 min-[481px]:w-auto"
      aria-label="주요 메뉴"
    >
      {MENUS.map(({ menu, href, label }) => {
        const isActive = menu === activeMenu;
        return (
          <Link
            key={menu}
            className={cn(navLinkClassName, isActive && activeNavLinkClassName)}
            href={href}
            aria-current={isActive ? "page" : undefined}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
