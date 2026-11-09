import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "../utils/cn";

export interface FieldMessage {
  text: string;
  tone: "error" | "success";
}

interface FormFieldProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "className"
> {
  id: string;
  label: string;
  // public/icons/movie-icons 아래 아이콘 파일 이름 (예: "mail")
  icon?: string;
  message?: FieldMessage | null;
  // 입력창 오른쪽에 붙는 버튼 (예: 중복 확인)
  action?: ReactNode;
}

export default function FormField({
  id,
  label,
  icon,
  message,
  action,
  ...inputProps
}: FormFieldProps) {
  const messageId = `${id}-message`;
  const isError = message?.tone === "error";

  return (
    <div>
      <label className="text-sm font-bold" htmlFor={id}>
        {label}
      </label>
      <div className="mt-2 flex gap-2">
        <div
          className={cn(
            "flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-lg border bg-(--color-bg-surface) px-3.5 focus-within:outline-2 focus-within:-outline-offset-1",
            isError
              ? "border-(--color-danger-default) focus-within:outline-(--color-danger-default)"
              : "border-(--color-border-default) focus-within:outline-(--color-action-primary)",
            inputProps.disabled && "bg-(--color-bg-page)",
          )}
        >
          {icon && (
            <img
              className="size-5 shrink-0 opacity-45"
              src={`/icons/movie-icons/${icon}.svg`}
              alt=""
            />
          )}
          <input
            id={id}
            className="h-full min-w-0 flex-1 bg-transparent text-sm text-(--color-text-primary) outline-none placeholder:text-(--color-text-tertiary) disabled:text-(--color-text-secondary)"
            aria-invalid={isError || undefined}
            aria-describedby={message ? messageId : undefined}
            {...inputProps}
          />
        </div>
        {action}
      </div>
      {message && (
        <p
          id={messageId}
          className={cn(
            "mt-2 text-[13px]",
            isError
              ? "text-(--color-danger-default)"
              : "text-(--color-action-primary)",
          )}
          role={isError ? "alert" : "status"}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}

export const secondaryButtonClassName =
  "h-12 shrink-0 rounded-md bg-(--color-text-primary) px-4 text-sm font-bold text-(--color-bg-surface) hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40";

export const primaryButtonClassName =
  "h-12 w-full rounded-md bg-(--color-action-primary) text-[15px] font-bold text-(--color-bg-surface) hover:bg-(--color-action-hover) active:bg-(--color-action-pressed) disabled:cursor-not-allowed disabled:bg-(--color-action-disabled)";
