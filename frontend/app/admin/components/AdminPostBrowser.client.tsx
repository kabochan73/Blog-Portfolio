"use client";

import { useEffect, useState } from "react";
import {
  listAdminPosts,
  deletePost,
} from "@/lib/api.posts.client";
import { listAdminTags } from "@/lib/api.tags.client";
import { revalidatePublicCache } from "@/lib/api.client";
import { Sidebar } from "@/components/Sidebar.client";
import { AdminPostList } from "@/app/admin/components/AdminPostList.client";
import type { Post, Tag } from "@/types";

export function AdminPostBrowser({
  statusFilter,
  getTitleHref,
}: {
  statusFilter?: (post: Post) => boolean;
  getTitleHref?: (post: Post) => string;
}) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedKey, setSelectedKey] = useState("all");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    listAdminPosts()
      .then(setPosts)
      .catch((e) =>
        setLoadError(e instanceof Error ? e.message : "読み込みに失敗しました")
      );
    listAdminTags().then(setTags);
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm("この記事を削除しますか？")) return;
    setDeleteError(null);
    try {
      await deletePost(id);
      setPosts((prev) => prev?.filter((post) => post.id !== id) ?? null);
      await revalidatePublicCache();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : "削除に失敗しました");
    }
  };

  if (loadError) {
    return <p className="text-red-600">{loadError}</p>;
  }

  if (!posts) {
    return <p>読み込み中...</p>;
  }

  const visiblePosts = statusFilter ? posts.filter(statusFilter) : posts;
  const filteredPosts =
    selectedKey === "all"
      ? visiblePosts
      : visiblePosts.filter((post) =>
          post.tags.some((tag) => String(tag.id) === selectedKey)
        );

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="order-2 sm:order-1 sm:flex-3">
        {deleteError && (
          <p className="mb-4 text-sm text-red-600">{deleteError}</p>
        )}
        <AdminPostList
          posts={filteredPosts}
          onDelete={handleDelete}
          getTitleHref={getTitleHref}
        />
      </div>
      <Sidebar tags={tags} selectedKey={selectedKey} onSelect={setSelectedKey} />
    </div>
  );
}
