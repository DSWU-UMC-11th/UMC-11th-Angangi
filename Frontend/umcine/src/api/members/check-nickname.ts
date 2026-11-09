import { serverClient } from "../server-client";
import type { AvailabilityResponse } from "./models";

function checkNickname(nickname: string) {
  return serverClient
    .get(`members/nickname/${encodeURIComponent(nickname)}`)
    .json<AvailabilityResponse>();
}

export { checkNickname };
