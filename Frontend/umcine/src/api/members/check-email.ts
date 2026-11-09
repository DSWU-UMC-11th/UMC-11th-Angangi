import { serverClient } from "../server-client";
import type { AvailabilityResponse } from "./models";

function checkEmail(email: string) {
  return serverClient
    .get(`members/email/${encodeURIComponent(email)}`)
    .json<AvailabilityResponse>();
}

export { checkEmail };
