import { create } from "zustand";
import type { MemberResponse } from "../api/members/models";

interface MockProfile extends MemberResponse {
  joinedAt: string;
}

interface MockProfileStore {
  profile: MockProfile;
  updateNickname: (nickname: string) => void;
}

// TODO(8주차): 로그인 후 내 정보 조회/수정 API로 바꾸고 이 store는 지워요.
// 지금은 화면 퍼블리싱 단계라, 수정한 값이 조회 화면에 반영되는지만 확인해요.
export const useMockProfileStore = create<MockProfileStore>()((set) => ({
  profile: {
    memberId: 1,
    email: "noco@umc.com",
    nickname: "수현",
    joinedAt: "2026-10-12",
  },
  updateNickname: (nickname) =>
    set((state) => ({ profile: { ...state.profile, nickname } })),
}));
