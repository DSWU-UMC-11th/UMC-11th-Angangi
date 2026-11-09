import { isHTTPError } from "ky";
import { useState } from "react";
import { checkEmail } from "../../api/members/check-email";
import { checkNickname } from "../../api/members/check-nickname";
import type { AvailabilityResponse } from "../../api/members/models";
import { cn } from "../../utils/cn";

type CheckStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid"
  | "error";

function getStatusMessage(
  status: Exclude<CheckStatus, "idle" | "checking">,
  label: string,
  invalidMessage: string,
) {
  if (status === "available") return `사용할 수 있는 ${label}이에요.`;
  if (status === "taken") return `이미 사용 중인 ${label}이에요.`;
  if (status === "invalid") return invalidMessage;
  return "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.";
}

export function SignupPage() {
  return (
    <main className="page-container flex-1 pt-8 pb-20">
      <h1 className="text-[28px] font-extrabold tracking-[-0.02em] min-[481px]:text-4xl">
        회원가입
      </h1>
      <p className="mt-2 text-sm text-(--color-text-secondary)">
        가입하기 전에 닉네임과 이메일이 이미 사용 중인지 확인해요.
      </p>

      <div className="mt-8 flex max-w-120 flex-col gap-6">
        <DuplicateCheckField
          id="signup-email"
          label="이메일"
          type="email"
          placeholder="umc@example.com"
          invalidMessage="이메일 형식이 올바르지 않아요."
          check={checkEmail}
        />
        <DuplicateCheckField
          id="signup-nickname"
          label="닉네임"
          type="text"
          placeholder="2~12자로 입력해 주세요"
          invalidMessage="닉네임은 2~12자로 입력해 주세요."
          check={checkNickname}
        />
      </div>
    </main>
  );
}

interface DuplicateCheckFieldProps {
  id: string;
  label: string;
  type: "email" | "text";
  placeholder: string;
  invalidMessage: string;
  check: (value: string) => Promise<AvailabilityResponse>;
}

function DuplicateCheckField({
  id,
  label,
  type,
  placeholder,
  invalidMessage,
  check,
}: DuplicateCheckFieldProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<CheckStatus>("idle");
  const trimmedValue = value.trim();

  async function handleCheck() {
    setStatus("checking");
    try {
      const { available } = await check(trimmedValue);
      setStatus(available ? "available" : "taken");
    } catch (error) {
      const isInvalid = isHTTPError(error) && error.response.status === 400;
      setStatus(isInvalid ? "invalid" : "error");
    }
  }

  return (
    <div>
      <label className="text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id={id}
          className="h-11 min-w-0 flex-1 rounded-lg border border-(--color-border-default) bg-(--color-bg-surface) px-3.5 text-sm text-(--color-text-primary) placeholder:text-(--color-text-tertiary) focus:outline-2 focus:-outline-offset-1 focus:outline-(--color-action-primary)"
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setStatus("idle");
          }}
        />
        <button
          type="button"
          className="h-11 shrink-0 rounded-md bg-(--color-text-primary) px-4 text-sm font-bold text-(--color-bg-surface) hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          disabled={!trimmedValue || status === "checking"}
          onClick={handleCheck}
        >
          {status === "checking" ? "확인 중" : "중복 확인"}
        </button>
      </div>
      {status !== "idle" && status !== "checking" && (
        <p
          className={cn(
            "mt-2 text-[13px]",
            status === "available"
              ? "text-(--color-action-primary)"
              : "text-(--color-danger-default)",
          )}
          role="status"
        >
          {getStatusMessage(status, label, invalidMessage)}
        </p>
      )}
    </div>
  );
}
