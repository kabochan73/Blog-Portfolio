import { clearAuth, markSessionExpired } from "@/lib/auth.client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const API_ORIGIN = new URL(API_URL).origin;

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

let csrfCookieReady: Promise<void> | null = null;

/**
 * Sanctum SPA cookie認証はCSRF保護のため、状態変更リクエストの前に
 * 一度だけ /sanctum/csrf-cookie を叩いてXSRF-TOKEN cookieを発行させる必要がある。
 * 発行後はログイン/ログアウトのたびにサーバー側で値が更新され、cookieとして
 * 都度返ってくるため、ここでは初回のみ呼べば良い。
 */
export function ensureCsrfCookie(): Promise<void> {
  csrfCookieReady ??= fetch(`${API_ORIGIN}/sanctum/csrf-cookie`, {
    credentials: "include",
  }).then(() => undefined);
  return csrfCookieReady;
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export async function authFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const method = (options.method ?? "GET").toUpperCase();

  if (!SAFE_METHODS.has(method)) {
    await ensureCsrfCookie();
  }

  const xsrfToken = getCookie("XSRF-TOKEN");

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(xsrfToken ? { "X-XSRF-TOKEN": xsrfToken } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    markSessionExpired();
    clearAuth();
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
  clearAuth();
}

export async function revalidatePublicCache(): Promise<void> {
  await fetch("/api/revalidate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tags: ["posts", "tags"] }),
  });
}
