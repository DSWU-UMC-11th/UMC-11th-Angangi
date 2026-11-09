// 서버 LocalDateTime "2026-10-12T21:00:00" → "2026-10-12"
export function formatDate(dateTime: string) {
  return dateTime.slice(0, 10);
}
