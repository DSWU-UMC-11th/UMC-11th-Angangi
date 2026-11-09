import {
  createFileRoute,
  Navigate,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useAuthStore } from "../../stores/auth-store";

// 괄호 폴더 (protected)의 route.tsx는 URL을 만들지 않는 공통 부모(Layout Route)예요.
// 폴더 안의 /my, /my/edit, /my/ratings는 화면을 그리기 전에 모두 이 검사를 거쳐요.
export const Route = createFileRoute("/(protected)")({
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().accessToken) {
      // 로그인 후 원래 보려던 페이지로 돌아올 수 있게 주소를 넘겨요
      throw redirect({ to: "/login", search: { redirect: location.href } });
    }
  },
  component: ProtectedLayout,
});

function ProtectedLayout() {
  const accessToken = useAuthStore((state) => state.accessToken);

  // beforeLoad는 페이지에 들어올 때만 실행돼요.
  // 페이지를 보는 중에 401로 토큰이 지워지면 여기서 로그인 화면으로 보내요.
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}
