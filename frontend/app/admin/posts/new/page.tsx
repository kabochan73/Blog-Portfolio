"use client";

import { useRouter } from "next/navigation";
import { PostForm } from "@/app/admin/components/PostForm.client";
import { createPost } from "@/lib/api.client.posts";
import { revalidatePublicCache } from "@/lib/api.client";
import type { PostInput } from "@/lib/api.client.posts";

export default function NewPostPage() {
  const router = useRouter();

  const handleSubmit = async (input: PostInput) => {
    await createPost(input);
    await revalidatePublicCache();
    router.push("/admin");
  };

  return (
    <div>
      <h1 className="mb-4 text-xl font-bold">新規作成</h1>
      <PostForm onSubmit={handleSubmit} submitLabel="作成する" />
    </div>
  );
}
