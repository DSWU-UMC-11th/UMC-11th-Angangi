import type { Metadata } from "next";
import { MyProfilePage } from "../../../views/members/my-profile-page";

export const metadata: Metadata = {
  title: "내 정보",
};

export default function MyProfileRoute() {
  return <MyProfilePage />;
}
