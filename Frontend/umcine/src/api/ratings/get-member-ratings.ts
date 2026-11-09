import { serverClient } from "../server-client";
import type { MemberRatingPage } from "./models";

interface GetMemberRatingsParams {
  memberId: number;
  page: number;
  size: number;
}

function getMemberRatings({ memberId, page, size }: GetMemberRatingsParams) {
  return serverClient
    .get(`members/${memberId}/ratings`, {
      searchParams: { page, size },
    })
    .json<MemberRatingPage>();
}

export { getMemberRatings };
