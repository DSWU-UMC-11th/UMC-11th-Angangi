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

export type { AvailabilityResponse, MemberResponse, SignupRequest };
