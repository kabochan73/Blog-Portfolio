import { authFetchJson } from "@/lib/api.client";
import type { ApiResponse, Tag } from "@/types";

export async function listAdminTags(): Promise<Tag[]> {
  const { data } = await authFetchJson<ApiResponse<Tag[]>>("/admin/tags");
  return data;
}

export async function createTag(name: string): Promise<Tag> {
  const { data } = await authFetchJson<ApiResponse<Tag>>("/admin/tags", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  return data;
}

export async function updateTag(id: number, name: string): Promise<Tag> {
  const { data } = await authFetchJson<ApiResponse<Tag>>(`/admin/tags/${id}`, {
    method: "PUT",
    body: JSON.stringify({ name }),
  });
  return data;
}

export async function deleteTag(id: number): Promise<void> {
  await authFetchJson<void>(`/admin/tags/${id}`, { method: "DELETE" });
}
