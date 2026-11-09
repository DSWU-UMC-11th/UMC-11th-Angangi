"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { useAuthHydrated } from "../hooks/use-auth-hydrated";
import { useAuthStore } from "../stores/auth-store";

export default function AuthGuard({ children }: { children: ReactNode }) {
  const isAuthHydrated = useAuthHydrated();
  const accessToken = useAuthStore((state) => state.accessToken);
  const pathname = usePathname();
  const router = useRouter();
  const wasLoggedIn = useRef(false);

  useEffect(() => {
    if (accessToken) {
      wasLoggedIn.current = true;
      return;
    }
    if (!isAuthHydrated) return;
    router.replace(
      wasLoggedIn.current
        ? "/"
        : `/login?redirect=${encodeURIComponent(pathname)}`,
    );
  }, [isAuthHydrated, accessToken, pathname, router]);

  if (!isAuthHydrated || !accessToken) return null;
  return children;
}
