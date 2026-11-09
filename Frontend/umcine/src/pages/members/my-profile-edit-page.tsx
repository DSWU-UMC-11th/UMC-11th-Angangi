import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type SubmitEvent } from "react";
import FormField, {
  primaryButtonClassName,
  type FieldMessage,
} from "../../components/form-field";
import { useMockProfileStore } from "../../stores/mock-profile-store";
import {
  isNicknameValid as checkNicknameFormat,
  isPasswordValid as checkPasswordFormat,
  VALIDATION_MESSAGE,
} from "../../utils/members/validation";

function errorMessage(show: boolean, text: string): FieldMessage | null {
  return show ? { tone: "error", text } : null;
}

export function MyProfileEditPage() {
  const profile = useMockProfileStore((state) => state.profile);
  const updateNickname = useMockProfileStore((state) => state.updateNickname);
  const navigate = useNavigate();

  // 현재 정보로 폼을 채운 상태에서 시작해요
  const [form, setForm] = useState({
    nickname: profile.nickname,
    password: "",
    passwordConfirm: "",
  });

  const trimmedNickname = form.nickname.trim();
  const isNicknameValid = checkNicknameFormat(form.nickname);
  const isNicknameChanged = trimmedNickname !== profile.nickname;
  // 비밀번호는 바꿀 때만 입력해요. 비워 두면 기존 비밀번호를 유지해요.
  const isPasswordChanging =
    form.password.length > 0 || form.passwordConfirm.length > 0;
  const isPasswordValid = checkPasswordFormat(form.password);
  const isPasswordConfirmValid = form.password === form.passwordConfirm;

  // 바뀐 항목이 있고, 바뀐 항목이 모두 유효해야 저장할 수 있어요
  const canSubmit =
    isNicknameValid &&
    (isNicknameChanged || isPasswordChanging) &&
    (!isPasswordChanging || (isPasswordValid && isPasswordConfirmValid));

  const handleChangeField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;
    // TODO(8주차): 내 정보 수정 API로 바꾸고, 닉네임 중복(MEMBER4092)을 처리해요
    updateNickname(trimmedNickname);
    alert("내 정보를 수정했어요.");
    navigate({ to: "/my" });
  };

  return (
    <main className="page-container flex flex-1 justify-center pt-8 pb-20">
      <div className="w-full max-w-110">
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
          내 정보 수정
        </h1>
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          바꾸고 싶은 항목만 수정해 주세요.
        </p>

        <form
          className="mt-8 flex flex-col gap-5 rounded-xl border border-(--color-border-default) bg-(--color-bg-surface) p-6 min-[481px]:p-8"
          onSubmit={handleSubmit}
          noValidate
        >
          <FormField
            id="edit-email"
            label="이메일"
            icon="mail"
            type="email"
            value={profile.email}
            disabled
          />
          <FormField
            id="edit-nickname"
            label="닉네임"
            icon="person"
            type="text"
            autoComplete="nickname"
            value={form.nickname}
            onChange={(event) =>
              handleChangeField("nickname", event.target.value)
            }
            message={errorMessage(
              !isNicknameValid,
              VALIDATION_MESSAGE.nickname,
            )}
          />
          <FormField
            id="edit-password"
            label="새 비밀번호"
            icon="lock"
            type="password"
            autoComplete="new-password"
            placeholder="바꾸지 않으려면 비워 두세요"
            value={form.password}
            onChange={(event) =>
              handleChangeField("password", event.target.value)
            }
            message={errorMessage(
              isPasswordChanging && !isPasswordValid,
              VALIDATION_MESSAGE.password,
            )}
          />
          <FormField
            id="edit-password-confirm"
            label="새 비밀번호 확인"
            icon="lock"
            type="password"
            autoComplete="new-password"
            placeholder="새 비밀번호를 한 번 더 입력해 주세요"
            value={form.passwordConfirm}
            onChange={(event) =>
              handleChangeField("passwordConfirm", event.target.value)
            }
            message={errorMessage(
              form.passwordConfirm.length > 0 && !isPasswordConfirmValid,
              VALIDATION_MESSAGE.passwordConfirm,
            )}
          />

          <div className="mt-2 flex gap-2">
            <Link
              className="flex h-12 flex-1 items-center justify-center rounded-md border border-(--color-border-default) text-[15px] font-bold text-(--color-text-primary) no-underline hover:bg-(--color-bg-page)"
              to="/my"
            >
              취소
            </Link>
            <button
              type="submit"
              className={`flex-2 ${primaryButtonClassName}`}
              disabled={!canSubmit}
            >
              저장하기
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
