interface RetryMessageProps {
  message: string;
  onRetry: () => void;
}

export default function RetryMessage({ message, onRetry }: RetryMessageProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-20 text-center text-(--color-text-secondary)">
      <p role="alert">{message}</p>
      <button
        type="button"
        className="h-10 rounded-md bg-(--color-text-primary) px-4 text-sm font-bold text-(--color-bg-surface) hover:opacity-85"
        onClick={onRetry}
      >
        다시 시도
      </button>
    </div>
  );
}
