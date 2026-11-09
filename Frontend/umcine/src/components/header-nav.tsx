"use client";

import { usePathname } from "next/navigation";
import HeaderNavLinks, { type HeaderMenu } from "./header-nav-links";

function getActiveMenu(pathname: string): HeaderMenu | null {
  if (pathname === "/" || pathname.startsWith("/movies/")) return "movies";
  if (pathname === "/search") return "search";
  if (pathname === "/my" || pathname.startsWith("/my/")) return "my";
  return null;
}

export default function HeaderNav() {
  const pathname = usePathname();
  return <HeaderNavLinks activeMenu={getActiveMenu(pathname)} />;
}
