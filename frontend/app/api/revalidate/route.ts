import { revalidateTag } from "next/cache";

const API_URL = process.env.API_URL;

export async function POST(request: Request) {
  const authorization = request.headers.get("Authorization");

  const verifyRes = await fetch(`${API_URL}/user`, {
    headers: authorization ? { Authorization: authorization } : {},
  });

  if (!verifyRes.ok) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  const { tags } = await request.json();

  for (const tag of tags as string[]) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated: true });
}
