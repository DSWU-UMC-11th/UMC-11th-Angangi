import { createFileRoute } from "@tanstack/react-router";
import { MyProfileEditPage } from "../../../pages/members/my-profile-edit-page";

export const Route = createFileRoute("/(protected)/my/edit")({
  component: MyProfileEditPage,
});
