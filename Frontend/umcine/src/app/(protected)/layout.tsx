import AuthGuard from "../../components/auth-guard";

export const instant = false;

export default function ProtectedLayout({ children }: LayoutProps<"/">) {
  return <AuthGuard>{children}</AuthGuard>;
}
