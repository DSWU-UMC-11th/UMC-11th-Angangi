import type { Metadata } from "next";
import { MyRatingsPage } from "../../../../views/members/my-ratings-page";

export const metadata: Metadata = {
  title: "내 평점",
};

export default function MyRatingsRoute() {
  return <MyRatingsPage />;
}
