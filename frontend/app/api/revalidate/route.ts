import { revalidateTag } from "next/cache";

const API_URL = process.env.API_URL;
// バックエンドがSanctumのstatefulドメイン判定に使うOriginヘッダー。
// このNext.jsサーバーからバックエンドへの直接呼び出しには本来のOriginが
// 付かないため、フロントエンドの公開オリジンを偽装して付与する。
const FRONTEND_ORIGIN = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie");

  const verifyRes = await fetch(`${API_URL}/user`, {
    headers: {
      ...(cookie ? { Cookie: cookie } : {}),
      Origin: FRONTEND_ORIGIN,
    },
  });

  if (!verifyRes.ok) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  let tags;
  try {
    ({ tags } = await request.json());
  } catch {
    return Response.json({ revalidated: false }, { status: 400 });
  }

  if (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string")) {
    return Response.json({ revalidated: false }, { status: 400 });
  }

  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated: true });
}
