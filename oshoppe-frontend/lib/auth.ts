import { CONFIG } from "./config";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
}

export function setTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN, accessToken);

  if (refreshToken) {
    window.localStorage.setItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  } else {
    window.localStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  }
}

export function clearTokens(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
  window.localStorage.removeItem(CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
