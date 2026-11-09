interface StudyMemberInterface {
  id: number;
  name: string;
  role: "admin" | "member" | "guest";
  githubId?: string;
}

type StudyMemberType = {
  id: number;
  name: string;
  role: "admin" | "member" | "guest";
  githubId?: string;
};

const studyHour: number | undefined = 0;

const withOr = studyHour || 1;
const withNullish = studyHour ?? 1;

console.log(`studyHour || 1 = ${withOr}`);
console.log(`studyHour ?? 1 = ${withNullish}`);

function formatMemberId(input: unknown): string {
  if (typeof input === "number") {
    return `회원 ID: ${input}`;
  }

  if (typeof input === "string") {
    return `회원 ID(문자열): ${input}`;
  }

  return "알 수 없는 형식의 ID입니다.";
}

console.log(formatMemberId(1));
console.log(formatMemberId("2"));
console.log(formatMemberId(true));
console.log(formatMemberId(null));
