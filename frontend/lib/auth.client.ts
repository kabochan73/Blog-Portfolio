import { useSyncExternalStore } from "react";

const TOKEN_KEY = "auth_token";

type Listener = () => void;
const listeners = new Set<Listener>();

function emitChange(): void {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getServerSnapshot(): undefined {
  return undefined;
}

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  emitChange();
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  emitChange();
}

/**
 * undefined = まだ確認できていない（SSR/hydration直後）
 * null      = 確認済み・未ログイン
 * string    = ログイン済みトークン
 */
export function useAuthToken(): string | null | undefined {
  return useSyncExternalStore(subscribe, getToken, getServerSnapshot);
}
