// 1. type과 interface 비교
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

// 정리 (세 문장)
// 1) 둘 다 객체의 형태(프로퍼티 이름과 타입)를 정의할 수 있고, 이 예시처럼 완전히 동일한 형태를 표현할 수 있다.
// 2) interface는 같은 이름으로 다시 선언하면 자동으로 병합(선언 병합)되고 extends로 확장하지만,
//    type은 재선언이 불가능한 대신 유니언/교차 타입처럼 객체가 아닌 값도 자유롭게 표현할 수 있다.
// 3) 객체나 클래스의 계약(모양)을 정의할 때는 관례적으로 interface를, 유니언 타입처럼 객체 형태를 벗어나는 경우에는 type을 사용한다.

// 2. || 와 ?? 비교
const studyHour: number | undefined = 0;

const withOr = studyHour || 1;
const withNullish = studyHour ?? 1;

console.log(`studyHour || 1 = ${withOr}`); // 1
console.log(`studyHour ?? 1 = ${withNullish}`); // 0

// 정리
// ||는 왼쪽 값이 "falsy"(0, "", NaN, null, undefined 등)이면 무조건 오른쪽 값을 사용하므로,
// studyHour가 0일 때도 falsy로 취급되어 결과가 1이 된다.
// ??는 왼쪽 값이 null 또는 undefined일 때만 오른쪽 값을 사용하므로,
// 0처럼 "값은 있지만 falsy"인 경우는 그대로 유지되어 결과가 0이 된다.

// 3. formatMemberId(input: unknown)
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
