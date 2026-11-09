import type { Metadata } from "next";
import { MyProfileEditPage } from "../../../../views/members/my-profile-edit-page";

export const metadata: Metadata = {
  title: "내 정보 수정",
};

export default function MyProfileEditRoute() {
  return <MyProfileEditPage />;
}
