// 회원가입, 로그인, 내 정보 수정에서 같은 규칙으로 입력값을 검사해요
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// 영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 모두 포함해 8자 이상
export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;
export const NICKNAME_MIN_LENGTH = 2;
export const NICKNAME_MAX_LENGTH = 12;

export const VALIDATION_MESSAGE = {
  email: "이메일 형식을 확인해 주세요.",
  nickname: `닉네임은 ${NICKNAME_MIN_LENGTH}~${NICKNAME_MAX_LENGTH}자로 입력해 주세요.`,
  password:
    "영문 대소문자, 숫자, 특수문자(!@#$%^&*)를 모두 포함해 8자 이상 입력해 주세요.",
  passwordConfirm: "비밀번호가 일치하지 않아요.",
};

export function isEmailValid(email: string) {
  return EMAIL_REGEX.test(email.trim());
}

export function isNicknameValid(nickname: string) {
  const { length } = nickname.trim();
  return length >= NICKNAME_MIN_LENGTH && length <= NICKNAME_MAX_LENGTH;
}

export function isPasswordValid(password: string) {
  return PASSWORD_REGEX.test(password);
}
