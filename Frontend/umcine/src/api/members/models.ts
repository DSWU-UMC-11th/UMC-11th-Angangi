interface AvailabilityResponse {
  available: boolean;
}

interface SignupRequest {
  email: string;
  nickname: string;
  password: string;
}

interface MemberResponse {
  memberId: number;
  email: string;
  nickname: string;
}

interface MemberInfo {
  email: string;
  nickname: string;
  createdAt: string;
}

export type { AvailabilityResponse, MemberInfo, MemberResponse, SignupRequest };
