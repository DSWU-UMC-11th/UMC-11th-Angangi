import { serverClient } from "../server-client";
import type { MemberRating } from "./models";

function getMemberRatings(memberId: number) {
  return serverClient
    .get(`members/${memberId}/ratings`)
    .json<MemberRating[]>();
}

export { getMemberRatings };
