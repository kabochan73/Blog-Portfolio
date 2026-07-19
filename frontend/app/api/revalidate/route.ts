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
