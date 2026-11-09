import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { useState, type ReactNode, type SubmitEvent } from "react";
import { getApiFailure } from "../../api/api-response";
import { memberQueries } from "../../api/members/member-queries";
import type { MemberInfo } from "../../api/members/models";
import FormField, {
  primaryButtonClassName,
  type FieldMessage,
} from "../../components/form-field";
import RetryMessage from "../../components/retry-message";
import { useUpdateMeMutation } from "../../hooks/use-update-me-mutation";
import {
  isNicknameValid as checkNicknameFormat,
  VALIDATION_MESSAGE,
} from "../../utils/members/validation";

const NICKNAME_DUPLICATED_CODE = "MEMBER4092";

export function MyProfileEditPage() {
  const meQuery = useQuery(memberQueries.me());

  if (meQuery.isPending) {
    return <EditMessage>내 정보를 불러오는 중이에요.</EditMessage>;
  }
  if (meQuery.isError) {
    return (
      <RetryMessage
        message="내 정보를 불러오지 못했어요."
        onRetry={() => meQuery.refetch()}
      />
    );
  }

  return <MyProfileEditForm profile={meQuery.data} />;
}

function MyProfileEditForm({ profile }: { profile: MemberInfo }) {
  const navigate = useNavigate();
  const updateMeMutation = useUpdateMeMutation();
  const isSubmitting = updateMeMutation.isPending;
  const [nickname, setNickname] = useState(profile.nickname);

  const trimmedNickname = nickname.trim();
  const isNicknameValid = checkNicknameFormat(nickname);
  const isNicknameChanged = trimmedNickname !== profile.nickname;
  const canSubmit = isNicknameValid && isNicknameChanged;

  const failure = getApiFailure(updateMeMutation.error);
  const isDuplicated = failure?.code === NICKNAME_DUPLICATED_CODE;
  let nicknameMessage: FieldMessage | null = null;
  if (!isNicknameValid) {
    nicknameMessage = { tone: "error", text: VALIDATION_MESSAGE.nickname };
  } else if (failure && isDuplicated) {
    nicknameMessage = { tone: "error", text: failure.message };
  }
  const submitError =
    updateMeMutation.isError && !isDuplicated
      ? (failure?.message ?? "내 정보 수정에 실패했어요. 다시 시도해 주세요.")
      : null;

  const handleChangeNickname = (value: string) => {
    if (isSubmitting) return;
    if (updateMeMutation.isError) updateMeMutation.reset();
    setNickname(value);
  };

  const handleSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    updateMeMutation.mutate(
      { nickname: trimmedNickname },
      {
        onSuccess: () => {
          alert("내 정보를 수정했어요.");
          navigate({ to: "/my" });
        },
      },
    );
  };

  return (
    <main className="page-container flex flex-1 justify-center pt-8 pb-20">
      <div className="w-full max-w-110">
        <h1 className="text-[28px] font-extrabold tracking-[-0.02em]">
          내 정보 수정
        </h1>
        <p className="mt-2 text-sm text-(--color-text-secondary)">
          닉네임을 바꿀 수 있어요.
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
            value={nickname}
            disabled={isSubmitting}
            onChange={(event) => handleChangeNickname(event.target.value)}
            message={nicknameMessage}
          />

          {submitError && (
            <p
              className="rounded-lg bg-(--color-danger-default)/8 px-4 py-3 text-[13px] text-(--color-danger-default)"
              role="alert"
            >
              {submitError}
            </p>
          )}
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
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? "저장 중" : "저장하기"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function EditMessage({ children }: { children: ReactNode }) {
  return (
    <main className="page-container flex-1 pt-8 pb-20 text-(--color-text-secondary)">
      <p>{children}</p>
    </main>
  );
}
