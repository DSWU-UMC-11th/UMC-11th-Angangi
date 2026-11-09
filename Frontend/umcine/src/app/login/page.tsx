import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginPage } from "../../views/auth/login-page";

export const metadata: Metadata = {
  title: "로그인",
};

export default function LoginRoute({ searchParams }: PageProps<"/login">) {
  return (
    <Suspense>
      <LoginScreen searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginScreen({
  searchParams,
}: Pick<PageProps<"/login">, "searchParams">) {
  const { redirect } = await searchParams;
  return (
    <LoginPage redirect={typeof redirect === "string" ? redirect : undefined} />
  );
}
