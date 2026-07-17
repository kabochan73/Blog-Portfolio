// サーバーコンポーネント専用。誤ってクライアントバンドルに含まれるとビルドエラーになる
import "server-only";
import type { Post, Tag } from "@/types";

const API_URL = process.env.API_URL;

export async function getPosts(): Promise<Post[]> {
  const res = await fetch(`${API_URL}/posts`, {
    // 管理画面での投稿・編集時にrevalidateTag('posts')で更新するオンデマンドISR方式
    cache: "force-cache",
    next: { tags: ["posts"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch posts: ${res.status}`);
  }

  // Laravelのリソースは{data: ...}でラップされるので剥がして返す
  const { data } = await res.json();
  return data;
}

export async function getPost(slug: string): Promise<Post | null> {
  const res = await fetch(`${API_URL}/posts/${slug}`, {
    cache: "force-cache",
    next: { tags: ["posts", `post:${slug}`] },
  });

  // 呼び出し側でnotFound()に使えるようnullを返す（他のエラーとは区別）
  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch post ${slug}: ${res.status}`);
  }

  const { data } = await res.json();
  return data;
}

export async function getTags(): Promise<Tag[]> {
  const res = await fetch(`${API_URL}/tags`, {
    cache: "force-cache",
    next: { tags: ["tags"] },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch tags: ${res.status}`);
  }

  const { data } = await res.json();
  return data;
}
