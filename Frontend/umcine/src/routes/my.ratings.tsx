import { createFileRoute } from "@tanstack/react-router";
import { MyRatingsPage } from "../pages/members/my-ratings-page";

export const Route = createFileRoute("/my/ratings")({
  component: MyRatingsPage,
});
