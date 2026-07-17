import { revalidateTag } from "next/cache";

export async function POST(request: Request) {
  const { tags } = await request.json();

  for (const tag of tags as string[]) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({ revalidated: true });
}
