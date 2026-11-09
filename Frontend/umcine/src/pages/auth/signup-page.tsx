import { useState, type SubmitEvent } from "react";
import { checkEmail } from "../../api/members/check-email";
import { checkNickname } from "../../api/members/check-nickname";
import FormField, {
  primaryButtonClassName,
  secondaryButtonClassName,
  type FieldMessage,
} from "../../components/form-field";

// 이메일 형식 검사
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 모두 포함해 8자 이상
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
const NICKNAME_MIN_LENGTH = 2;
const NICKNAME_MAX_LENGTH = 12;

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

  // 입력값의 유효성 검사
  const trimmedEmail = form.email.trim();
  const trimmedNickname = form.nickname.trim();
  const isEmailValid = EMAIL_REGEX.test(trimmedEmail);
  const isNicknameValid =
    trimmedNickname.length >= NICKNAME_MIN_LENGTH &&
    trimmedNickname.length <= NICKNAME_MAX_LENGTH;
  const isPasswordValid = PASSWORD_REGEX.test(form.password);
  const isPasswordConfirmValid =
    form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;

  // 입력을 시작한 필드에만 오류 표시
  const showEmailError = form.email.length > 0 && !isEmailValid;
  const showNicknameError = form.nickname.length > 0 && !isNicknameValid;
  const showPasswordError = form.password.length > 0 && !isPasswordValid;
  const showPasswordConfirmError =
    form.passwordConfirm.length > 0 && !isPasswordConfirmValid;

  // 모든 입력값이 유효하면 제출 버튼 활성화
  const isFormValid =
    isEmailValid &&
    isNicknameValid &&
    isPasswordValid &&
    isPasswordConfirmValid;

  const handleChangeField = (key: FormKey, value: string) => {
    if (key === "email" || key === "nickname") {
      setDuplicateCheck((prev) => ({ ...prev, [key]: "idle" }));
    }
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleCheckDuplicate = async (key: DuplicateCheckKey) => {
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
    // 폼 제출 시 페이지 새로고침 방지
    event.preventDefault();
    // 3.4에서 회원가입 API 요청 추가
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

        {/* noValidate는 폼 제출 시 브라우저의 기본 유효성 검사를 꺼요 */}
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
            onChange={(event) => handleChangeField("email", event.target.value)}
            message={
              showEmailError
                ? { tone: "error", text: "이메일 형식을 확인해 주세요." }
                : getDuplicateCheckMessage(duplicateCheck.email, "email")
            }
            action={
              <DuplicateCheckButton
                disabled={!isEmailValid}
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
            onChange={(event) =>
              handleChangeField("nickname", event.target.value)
            }
            message={
              showNicknameError
                ? {
                    tone: "error",
                    text: `닉네임은 ${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자로 입력해 주세요.`,
                  }
                : getDuplicateCheckMessage(duplicateCheck.nickname, "nickname")
            }
            action={
              <DuplicateCheckButton
                disabled={!isNicknameValid}
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
            onChange={(event) =>
              handleChangeField("password", event.target.value)
            }
            message={
              showPasswordError
                ? {
                    tone: "error",
                    text: "영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 모두 포함해 8자 이상 입력해 주세요.",
                  }
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
            onChange={(event) =>
              handleChangeField("passwordConfirm", event.target.value)
            }
            message={
              showPasswordConfirmError
                ? { tone: "error", text: "비밀번호가 일치하지 않아요." }
                : null
            }
          />

          <button
            type="submit"
            className={`mt-2 ${primaryButtonClassName}`}
            disabled={!isFormValid}
          >
            가입하기
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-(--color-text-secondary)">
          이미 계정이 있나요?{" "}
          {/* TODO: 필수 미션에서 /login 라우트를 만든 뒤 Link로 바꾸기 */}
          <span className="font-bold text-(--color-text-primary)">
            로그인
          </span>
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
