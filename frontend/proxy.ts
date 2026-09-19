import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// バックエンド(Laravel Sanctum)のセッションcookie名。
// バックエンドの .env の SESSION_COOKIE と合わせておくこと。
const SESSION_COOKIE_NAME =
  process.env.NEXT_PUBLIC_SESSION_COOKIE_NAME ?? "blog_session";

// Proxy(旧middleware)はプリフェッチも含め全リクエストで実行され、
// 遅いデータ取得を行うべきではないため、ここではcookieの有無だけを見る
// 楽観的チェックに留める。cookieはhttpOnlyだがサーバー側からは読める。
// 実際の認証の正当性(有効期限切れ等)はAPIリクエスト自体で検証され、
// 無効なら401になり、クライアント側(admin/layout)が/loginへ誘導する。
export function proxy(request: NextRequest) {
  const hasSessionCookie = request.cookies.has(SESSION_COOKIE_NAME);

  if (!hasSessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
