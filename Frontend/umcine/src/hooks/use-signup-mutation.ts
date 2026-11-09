import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { signup } from "../api/members/signup";

// 7주차 try 안의 성공 처리는 onSuccess로 옮겼어요.
// 실패 안내는 화면마다 보여주는 위치가 달라서, 컴포넌트가 mutation.error로 직접 그려요.
export function useSignupMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: signup,
    onSuccess: (response) => {
      alert(response.message);
      navigate({ to: "/login" });
    },
  });
}
