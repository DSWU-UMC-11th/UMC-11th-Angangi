import { useSyncExternalStore } from "react";
import { useAuthStore } from "../stores/auth-store";

function subscribe(onStoreChange: () => void) {
  return useAuthStore.persist.onFinishHydration(onStoreChange);
}

export function useAuthHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}
