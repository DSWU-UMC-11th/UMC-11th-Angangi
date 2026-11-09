"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { memberQueries } from "../api/members/member-queries";
import { useAuthHydrated } from "../hooks/use-auth-hydrated";
import { useAuthStore } from "../stores/auth-store";

const primaryLinkClassName =
  "flex h-10 items-center rounded-md bg-(--color-action-primary) px-4 text-sm font-bold text-(--color-bg-surface) no-underline hover:bg-(--color-action-hover) active:bg-(--color-action-pressed)";

export default function HeaderAuthActions() {
  const isAuthHydrated = useAuthHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);
  const meQuery = useQuery({
    ...memberQueries.me(),
    enabled: Boolean(accessToken),
  });

  if (!isAuthHydrated || (accessToken && meQuery.isLoading)) {
    return (
      <span
        className="h-10 w-24 animate-pulse rounded-md bg-(--color-border-default)"
        aria-label="내 정보를 불러오는 중"
      />
    );
  }

  if (!accessToken) {
    return (
      <>
        <Link
          className="flex h-10 items-center rounded-md border border-(--color-border-default) bg-(--color-bg-surface) px-4 text-sm font-bold text-(--color-text-primary) no-underline hover:bg-(--color-bg-page)"
          href="/signup"
        >
          회원가입
        </Link>
        <Link className={primaryLinkClassName} href="/login">
          로그인
        </Link>
      </>
    );
  }

  return (
    <Link className={primaryLinkClassName} href="/my">
      마이페이지
    </Link>
  );
}
