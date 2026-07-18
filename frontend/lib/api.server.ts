// サーバーコンポーネント専用。誤ってクライアントバンドルに含まれるとビルドエラーになる
import "server-only";
import type { Post, Tag } from "@/types";

const API_URL = process.env.API_URL;

export async function getPosts(): Promise<Post[]> {
  try {
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
  } catch (e) {
    // デプロイ直後などバックエンド未接続時にビルド/描画自体を落とさない
    console.error(e);
    return [];
  }
}

export async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_URL}/posts/${slug}`, {
      cache: "force-cache",
      next: { tags: ["posts", `post:${slug}`] },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch post ${slug}: ${res.status}`);
    }

    const { data } = await res.json();
    return data;
  } catch (e) {
    // 404も含め、呼び出し側でnotFound()に使えるようnullを返す
    console.error(e);
    return null;
  }
}

export async function getTags(): Promise<Tag[]> {
  try {
    const res = await fetch(`${API_URL}/tags`, {
      cache: "force-cache",
      next: { tags: ["tags"] },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch tags: ${res.status}`);
    }

    const { data } = await res.json();
    return data;
  } catch (e) {
    console.error(e);
    return [];
  }
}
