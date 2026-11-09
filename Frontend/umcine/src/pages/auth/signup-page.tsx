import { Link } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import { checkEmail } from "../../api/members/check-email";
import { checkNickname } from "../../api/members/check-nickname";
import { getApiFailure } from "../../api/api-response";
import FormField, {
  primaryButtonClassName,
  secondaryButtonClassName,
  type FieldMessage,
} from "../../components/form-field";
import { useSignupMutation } from "../../hooks/use-signup-mutation";
import {
  isEmailValid as checkEmailFormat,
  isNicknameValid as checkNicknameFormat,
  isPasswordValid as checkPasswordFormat,
  VALIDATION_MESSAGE,
} from "../../utils/members/validation";

const DEFAULT_FORM = {
  email: "",
  nickname: "",
  password: "",
  passwordConfirm: "",
};

type FormKey = keyof typeof DEFAULT_FORM;
type DuplicateCheckKey = "email" | "nickname";
type DuplicateCheckStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "error";

const DUPLICATE_CHECK_LABEL: Record<DuplicateCheckKey, string> = {
  email: "이메일",
  nickname: "닉네임",
};

const DUPLICATE_CHECK_REQUEST = {
  email: checkEmail,
  nickname: checkNickname,
};

const DUPLICATED_CODE_TO_KEY: Record<string, DuplicateCheckKey> = {
  MEMBER4091: "email",
  MEMBER4092: "nickname",
};

function getDuplicateCheckMessage(
  status: DuplicateCheckStatus,
  key: DuplicateCheckKey,
): FieldMessage | null {
  const label = DUPLICATE_CHECK_LABEL[key];
  if (status === "available") {
    return { tone: "success", text: `사용할 수 있는 ${label}이에요.` };
  }
  if (status === "taken") {
    return { tone: "error", text: `이미 사용 중인 ${label}이에요.` };
  }
  if (status === "error") {
    return {
      tone: "error",
      text: "중복 확인에 실패했어요. 다시 시도해 주세요.",
    };
  }
  return null;
}

export function SignupPage() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [duplicateCheck, setDuplicateCheck] = useState<
    Record<DuplicateCheckKey, DuplicateCheckStatus>
  >({ email: "idle", nickname: "idle" });
  const signupMutation = useSignupMutation();
  const isSubmitting = signupMutation.isPending;
  const submitError = signupMutation.isError
    ? (getApiFailure(signupMutation.error)?.message ??
      "회원가입에 실패했어요. 다시 시도해 주세요.")
    : null;

  const trimmedEmail = form.email.trim();
  const trimmedNickname = form.nickname.trim();
  const isEmailValid = checkEmailFormat(form.email);
  const isNicknameValid = checkNicknameFormat(form.nickname);
  const isPasswordValid = checkPasswordFormat(form.password);
  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;

  const showEmailError = form.email.length > 0 && !isEmailValid;
  const showNicknameError = form.nickname.length > 0 && !isNicknameValid;
  const showPasswordError = form.password.length > 0 && !isPasswordValid;
  const showPasswordConfirmError =
    form.passwordConfirm.length > 0 && !isPasswordConfirmValid;

  const isFormValid =
    isEmailValid &&
    isNicknameValid &&
    isPasswordValid &&
    isPasswordConfirmValid;

  const canSubmit =
    isFormValid &&
    duplicateCheck.email === "available" &&
    duplicateCheck.nickname === "available";

  const handleChangeField = (key: FormKey, value: string) => {
    if (isSubmitting) return;
    if (signupMutation.isError) signupMutation.reset();
    if (key === "email" || key === "nickname") {
      if (duplicateCheck[key] === "checking") return;
      setDuplicateCheck((prev) => ({ ...prev, [key]: "idle" }));
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckDuplicate = async (key: DuplicateCheckKey) => {
    const isValid = key === "email" ? isEmailValid : isNicknameValid;
    if (!isValid || duplicateCheck[key] === "checking") return;

    setDuplicateCheck((prev) => ({ ...prev, [key]: "checking" }));
    try {
      const value = key === "email" ? trimmedEmail : trimmedNickname;
      const { available } = await DUPLICATE_CHECK_REQUEST[key](value);
      setDuplicateCheck((prev) => ({
        ...prev,
        [key]: available ? "available" : "taken",
      }));
    } catch {
      setDuplicateCheck((prev) => ({ ...prev, [key]: "error" }));
    }
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    signupMutation.mutate(
      {
        email: trimmedEmail,
        nickname: trimmedNickname,
        password: form.password,
      },
      {
        onError: (error) => {
          const failure = getApiFailure(error);
          const duplicatedKey = failure && DUPLICATED_CODE_TO_KEY[failure.code];
          if (duplicatedKey) {
            setDuplicateCheck((prev) => ({ ...prev, [duplicatedKey]: "taken" }));
          }
        },
      },
    );
  };

  return (
    <main className="page-container flex flex-1 justify-center pt-12 pb-20">
      <div className="w-full max-w-110">
        <h1 className="text-center text-[28px] font-extrabold tracking-[-0.02em]">
          회원가입
        </h1>
        <p className="mt-2 text-center text-sm text-(--color-text-secondary)">
          UMCine에서 영화 기록을 시작해 보세요.
        </p>

        <form
          className="mt-8 flex flex-col gap-5 rounded-xl border border-(--color-border-default) bg-(--color-bg-surface) p-6 min-[481px]:p-8"
          onSubmit={handleSubmit}
          noValidate
        >
          <FormField
            id="signup-email"
            label="이메일"
            icon="mail"
            type="email"
            autoComplete="email"
            placeholder="umc@example.com"
            value={form.email}
            disabled={isSubmitting || duplicateCheck.email === "checking"}
            onChange={(event) => handleChangeField("email", event.target.value)}
            message={
              showEmailError
                ? { tone: "error", text: VALIDATION_MESSAGE.email }
                : getDuplicateCheckMessage(duplicateCheck.email, "email")
            }
            action={
              <DuplicateCheckButton
                disabled={!isEmailValid || isSubmitting}
                isChecking={duplicateCheck.email === "checking"}
                onClick={() => handleCheckDuplicate("email")}
              />
            }
          />
          <FormField
            id="signup-nickname"
            label="닉네임"
            icon="person"
            type="text"
            autoComplete="nickname"
            placeholder="2~12자로 입력해 주세요"
            value={form.nickname}
            disabled={isSubmitting || duplicateCheck.nickname === "checking"}
            onChange={(event) =>
              handleChangeField("nickname", event.target.value)
            }
            message={
              showNicknameError
                ? { tone: "error", text: VALIDATION_MESSAGE.nickname }
                : getDuplicateCheckMessage(duplicateCheck.nickname, "nickname")
            }
            action={
              <DuplicateCheckButton
                disabled={!isNicknameValid || isSubmitting}
                isChecking={duplicateCheck.nickname === "checking"}
                onClick={() => handleCheckDuplicate("nickname")}
              />
            }
          />
          <FormField
            id="signup-password"
            label="비밀번호"
            icon="lock"
            type="password"
            autoComplete="new-password"
            placeholder="영문 대소문자, 숫자, 특수문자 포함 8자 이상"
            value={form.password}
            disabled={isSubmitting}
            onChange={(event) =>
              handleChangeField("password", event.target.value)
            }
            message={
              showPasswordError
                ? { tone: "error", text: VALIDATION_MESSAGE.password }
                : null
            }
          />
          <FormField
            id="signup-password-confirm"
            label="비밀번호 확인"
            icon="lock"
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호를 한 번 더 입력해 주세요"
            value={form.passwordConfirm}
            disabled={isSubmitting}
            onChange={(event) =>
              handleChangeField("passwordConfirm", event.target.value)
            }
            message={
              showPasswordConfirmError
                ? { tone: "error", text: VALIDATION_MESSAGE.passwordConfirm }
                : null
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
            {isSubmitting ? "가입 중" : "가입하기"}
          </button>
          {isFormValid && !canSubmit && (
            <p className="-mt-2 text-center text-[13px] text-(--color-text-secondary)">
              이메일과 닉네임 중복 확인을 마치면 가입할 수 있어요.
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-sm text-(--color-text-secondary)">
          이미 계정이 있나요?{" "}
          <Link
            className="font-bold text-(--color-action-primary) hover:underline"
            to="/login"
          >
            로그인
          </Link>
        </p>
      </div>
    </main>
  );
}

interface DuplicateCheckButtonProps {
  disabled: boolean;
  isChecking: boolean;
  onClick: () => void;
}

function DuplicateCheckButton({
  disabled,
  isChecking,
  onClick,
}: DuplicateCheckButtonProps) {
  return (
    <button
      type="button"
      className={secondaryButtonClassName}
      disabled={disabled || isChecking}
      onClick={onClick}
    >
      {isChecking ? "확인 중" : "중복 확인"}
    </button>
  );
}
