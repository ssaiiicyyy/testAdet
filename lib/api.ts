import { CONFIG } from "./config";
import { getAccessToken } from "./auth";

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { requiresAuth = false, headers, ...restOptions } = options;

  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (requiresAuth) {
    const token = getAccessToken();
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
    headers: {
      ...defaultHeaders,
      ...(headers ?? {}),
    },
    ...restOptions,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data !== null && "message" in data
        ? Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message
        : undefined;

    throw new ApiError(message || "An unexpected error occurred.", response.status);
  }

  return data as T;
}
