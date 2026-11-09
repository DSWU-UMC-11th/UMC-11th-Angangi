import { createFileRoute } from "@tanstack/react-router";
import { MyProfilePage } from "../../../pages/members/my-profile-page";

export const Route = createFileRoute("/(protected)/my/")({
  component: MyProfilePage,
});
