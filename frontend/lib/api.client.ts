import { getToken, clearToken, markSessionExpired } from "@/lib/auth.client";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    markSessionExpired();
    clearToken();
  }

  return res;
}

export async function authFetchJson<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await authFetch(path, options);

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      body.message ?? "リクエストに失敗しました",
      body.errors
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json();
}

export async function logout(): Promise<void> {
  await authFetch("/logout", { method: "POST" });
  clearToken();
}

export async function revalidatePublicCache(): Promise<void> {
  const token = getToken();
  await fetch("/api/revalidate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ tags: ["posts", "tags"] }),
  });
}
