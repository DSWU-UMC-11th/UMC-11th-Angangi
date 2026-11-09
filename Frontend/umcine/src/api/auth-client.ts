import { useAuthStore } from "../stores/auth-store";
import { clearSession } from "../utils/auth/clear-session";
import { serverClient } from "./server-client";

export const authClient = serverClient.extend({
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const { accessToken } = useAuthStore.getState();
        if (accessToken) {
          request.headers.set("Authorization", `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      ({ response }) => {
        if (response.status === 401) {
          clearSession();
        }
      },
    ],
  },
});
