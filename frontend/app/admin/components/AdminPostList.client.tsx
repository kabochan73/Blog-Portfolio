"use client";

import Link from "next/link";
import type { Post } from "@/types";

export function AdminPostList({
  posts,
  onDelete,
  getTitleHref,
}: {
  posts: Post[];
  onDelete: (id: number) => void;
  getTitleHref?: (post: Post) => string;
}) {
  if (posts.length === 0) {
    return <p className="text-zinc-500">記事がありません。</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {posts.map((post) => (
        <li
          key={post.id}
          className="border border-zinc-200 p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {getTitleHref ? (
                <Link href={getTitleHref(post)} className="hover:underline">
                  {post.title}
                </Link>
              ) : (
                post.title
              )}
            </h2>
            <div className="flex gap-3 text-sm">
              <Link href={`/admin/posts/${post.id}`} className="underline">
                編集
              </Link>
              <button
                type="button"
                onClick={() => onDelete(post.id)}
                className="text-red-600"
              >
                削除
              </button>
            </div>
          </div>
          <div className="flex items-center pt-2 gap-2">
            <span className="text-sm text-zinc-500">
              {post.status === "published" ? "公開" : "下書き"}
            </span>
            {post.tags.length > 0 && (
              <ul className="flex gap-1">
                {post.tags.map((tag) => (
                  <li
                    key={tag.id}
                    className="bg-black px-2 py-0.5 text-xs text-white"
                  >
                    {tag.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
