import { authFetchJson } from "@/lib/api.client";
import type { Post, PostStatus } from "@/types";

export type PostInput = {
  title: string;
  slug: string;
  body: string;
  status: PostStatus;
  tag_ids: number[];
};

export async function listAdminPosts(): Promise<Post[]> {
  const { data } = await authFetchJson<{ data: Post[] }>("/admin/posts");
  return data;
}

export async function getAdminPost(id: number): Promise<Post> {
  const { data } = await authFetchJson<{ data: Post }>(`/admin/posts/${id}`);
  return data;
}

export async function createPost(input: PostInput): Promise<Post> {
  const { data } = await authFetchJson<{ data: Post }>("/admin/posts", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return data;
}

export async function updatePost(id: number, input: PostInput): Promise<Post> {
  const { data } = await authFetchJson<{ data: Post }>(`/admin/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return data;
}

export async function deletePost(id: number): Promise<void> {
  await authFetchJson<void>(`/admin/posts/${id}`, { method: "DELETE" });
}
