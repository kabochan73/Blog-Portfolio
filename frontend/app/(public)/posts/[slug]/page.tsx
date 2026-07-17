import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getPost } from "@/lib/api";

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <article className="max-w-4xl mx-auto border-x border-zinc-400 px-12 py-4 pb-12">
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
        <div className="mt-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
        </div>
      </article>
      <div className="mt-6 flex justify-end">
        <Link
          href="/"
          className="bg-black text-white px-3 py-1 mr-4 text-xl hover:bg-gray-700"
        >
          Back
        </Link>
      </div>
    </>
  );
}
