"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAdminPost } from "@/lib/api.posts.client";
import type { Post } from "@/types";

export default function DraftPreviewPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getAdminPost(Number(id))
      .then(setPost)
      .catch((e) =>
        setLoadError(e instanceof Error ? e.message : "読み込みに失敗しました")
      );
  }, [id]);

  if (loadError) {
    return <p className="text-red-600">{loadError}</p>;
  }

  if (!post) {
    return <p>読み込み中...</p>;
  }

  return (
    <article className="max-w-4xl mx-auto border border-zinc-400 p-12">
      <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
      <div className="flex items-center gap-2 border-b border-zinc-500 pb-4">
        <time dateTime={post.created_at} className="text-sm text-zinc-500">
          {new Date(post.created_at).toLocaleDateString("ja-JP")}
        </time>
        {post.tags.length > 0 && (
          <ul className="flex gap-2">
            {post.tags.map((tag) => (
              <li
                key={tag.id}
                className="rounded bg-black px-2 py-0.5 text-sm text-white font-bold"
              >
                {tag.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="prose prose-xl mt-4 max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
      </div>
    </article>
  );
}
