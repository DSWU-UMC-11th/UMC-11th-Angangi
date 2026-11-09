import { Link, useSearch } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import { getApiFailure } from "../../api/api-response";
import FormField, { primaryButtonClassName } from "../../components/form-field";
import { useLoginMutation } from "../../hooks/use-login-mutation";
import {
  isEmailValid as checkEmailFormat,
  VALIDATION_MESSAGE,
} from "../../utils/members/validation";

const DEFAULT_FORM = { email: "", password: "" };

type FormKey = keyof typeof DEFAULT_FORM;

export function LoginPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  // 로그인이 필요한 페이지에서 왔다면 ?redirect=/my/edit 처럼 돌아갈 주소가 있어요
  const { redirect } = useSearch({ from: "/login" });
  const loginMutation = useLoginMutation(redirect);
  const isSubmitting = loginMutation.isPending;
  // 비밀번호가 틀리면 서버가 401 AUTH401_1과 안내 문구를 줘요
  const submitError = loginMutation.isError
    ? (getApiFailure(loginMutation.error)?.message ??
      "로그인에 실패했어요. 다시 시도해 주세요.")
    : null;

  const isEmailValid = checkEmailFormat(form.email);
  const showEmailError = form.email.length > 0 && !isEmailValid;
  // 로그인에서는 비밀번호 규칙을 다시 검사하지 않아요.
  // 맞는 비밀번호인지는 서버가 판단하고, 화면은 빈 값만 막아요.
  const canSubmit = isEmailValid && form.password.length > 0;

  const handleChangeField = (key: FormKey, value: string) => {
    if (isSubmitting) return;
    if (loginMutation.isError) loginMutation.reset();
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    loginMutation.mutate({
      email: form.email.trim(),
      password: form.password,
    });
  };

  return (
    <main className="page-container flex flex-1 justify-center pt-12 pb-20">
      <div className="w-full max-w-110">
        <h1 className="text-center text-[28px] font-extrabold tracking-[-0.02em]">
          로그인
        </h1>
        <p className="mt-2 text-center text-sm text-(--color-text-secondary)">
          다시 만나서 반가워요. 계정 정보를 입력해 주세요.
        </p>

        <form
          className="mt-8 flex flex-col gap-5 rounded-xl border border-(--color-border-default) bg-(--color-bg-surface) p-6 min-[481px]:p-8"
          onSubmit={handleSubmit}
          noValidate
        >
          <FormField
            id="login-email"
            label="이메일"
            icon="mail"
            type="email"
            autoComplete="email"
            placeholder="umc@example.com"
            value={form.email}
            disabled={isSubmitting}
            onChange={(event) => handleChangeField("email", event.target.value)}
            message={
              showEmailError
                ? { tone: "error", text: VALIDATION_MESSAGE.email }
                : null
            }
          />
          <FormField
            id="login-password"
            label="비밀번호"
            icon="lock"
            type="password"
            autoComplete="current-password"
            placeholder="비밀번호를 입력해 주세요"
            value={form.password}
            disabled={isSubmitting}
            onChange={(event) =>
              handleChangeField("password", event.target.value)
            }
          />

          {submitError && (
            <p
              className="rounded-lg bg-(--color-danger-default)/8 px-4 py-3 text-[13px] text-(--color-danger-default)"
              role="alert"
            >
              {submitError}
            </p>
          )}
          <button
            type="submit"
            className={`mt-2 ${primaryButtonClassName}`}
            disabled={!canSubmit || isSubmitting}
          >
            {isSubmitting ? "로그인 중" : "로그인"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-(--color-text-secondary)">
          아직 계정이 없나요?{" "}
          <Link
            className="font-bold text-(--color-action-primary) hover:underline"
            to="/signup"
          >
            회원가입
          </Link>
        </p>
      </div>
    </main>
  );
}
