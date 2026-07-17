"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PostForm } from "@/app/admin/components/PostForm.client";
import { getAdminPost, updatePost } from "@/lib/api.client.posts";
import { revalidatePublicCache } from "@/lib/api.client";
import type { PostInput } from "@/lib/api.client.posts";
import type { Post } from "@/types";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getAdminPost(Number(id))
      .then(setPost)
      .catch((e) =>
        setLoadError(e instanceof Error ? e.message : "読み込みに失敗しました")
      );
  }, [id]);

  const handleSubmit = async (input: PostInput) => {
    await updatePost(Number(id), input);
    await revalidatePublicCache();
    router.push("/admin");
  };

  if (loadError) {
    return <p className="text-red-600">{loadError}</p>;
  }

  if (!post) {
    return <p>読み込み中...</p>;
  }

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">編集</h1>
      <PostForm
        initialPost={post}
        onSubmit={handleSubmit}
        submitLabel="更新する"
      />
    </div>
  );
}
