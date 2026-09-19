import { useSyncExternalStore } from "react";

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

type AuthState =
  | { status: "unknown" }
  | { status: "guest" }
  | { status: "authenticated"; user: AuthUser };

const UNKNOWN_STATE: AuthState = { status: "unknown" };
const GUEST_STATE: AuthState = { status: "guest" };

let state: AuthState = UNKNOWN_STATE;
let sessionExpired = false;

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AuthState {
  return state;
}

function getServerSnapshot(): AuthState {
  return UNKNOWN_STATE;
}

export function setAuthenticatedUser(user: AuthUser): void {
  state = { status: "authenticated", user };
  emitChange();
}

export function clearAuth(): void {
  state = GUEST_STATE;
  emitChange();
}

export function markSessionExpired(): void {
  sessionExpired = true;
}

/** admin/layoutのリダイレクト時に一度だけ読み取り、読んだら消費する */
export function consumeSessionExpired(): boolean {
  const expired = sessionExpired;
  sessionExpired = false;
  return expired;
}

/**
 * cookieはhttpOnlyでJSから直接読めないため、バックエンドに問い合わせて
 * 現在ログイン中かどうかを確認する。admin/layoutが初回マウント時に呼び出す。
 */
export async function checkAuth(): Promise<void> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  try {
    const res = await fetch(`${apiUrl}/user`, { credentials: "include" });
    if (res.ok) {
      setAuthenticatedUser(await res.json());
      return;
    }
  } catch {
    // ネットワークエラー時も未ログイン扱いにする
  }
  clearAuth();
}

/**
 * "unknown"       = まだ確認できていない（初回マウント直後）
 * "guest"         = 確認済み・未ログイン
 * "authenticated" = ログイン済み（userを含む）
 */
export function useAuthState(): AuthState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
