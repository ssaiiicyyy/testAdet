"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { CONFIG } from "@/lib/config";

interface AuthGuardOptions {
  requireAuth?: boolean;
}

function subscribeToStorage(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

export function useAuthGuard(
  { requireAuth = true }: AuthGuardOptions = {}
) {
  const router = useRouter();
  const userIsAuth = useSyncExternalStore(
    subscribeToStorage,
    isAuthenticated,
    () => null
  );

  useEffect(() => {
    if (userIsAuth === null) return;

    if (requireAuth && !userIsAuth) {
      router.replace(CONFIG.ROUTES.LOGIN);
    } else if (!requireAuth && userIsAuth) {
      router.replace(CONFIG.ROUTES.DASHBOARD);
    }
  }, [requireAuth, router, userIsAuth]);

  return {
    isChecking: userIsAuth === null || requireAuth !== userIsAuth,
  };
}