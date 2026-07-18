import Link from "next/link";
import type { Post } from "@/types";

export function PostList({
  posts,
  getHref = (post) => `/posts/${post.slug}`,
}: {
  posts: Post[];
  getHref?: (post: Post) => string;
}) {
  if (posts.length === 0) {
    return <p className="text-zinc-500">記事がありません。</p>;
  }

  return (
    <ul className="flex flex-col gap-4">
      {posts.map((post) => (
        <li
          key={post.id}
          className="border border-zinc-200 shadow-sm hover:shadow-md transition-shadow"
        >
          <Link href={getHref(post)} className="block p-6">
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <div className="flex items-center pt-2 gap-2">
              <time
                dateTime={post.created_at}
                className="text-sm text-zinc-500"
              >
                {new Date(post.created_at).toLocaleDateString("ja-JP")}
              </time>
              {post.tags.length > 0 && (
                <ul className="flex gap-1">
                  {post.tags.map((tag) => (
                    <li
                      key={tag.id}
                      className="bg-black px-2 py-0.5 text-xs font-bold text-white"
                    >
                      {tag.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
