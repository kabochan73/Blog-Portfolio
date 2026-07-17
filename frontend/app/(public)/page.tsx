import { getPosts, getTags } from "@/lib/api.server";
import { PostBrowser } from "@/app/(public)/components/PostBrowser.client";
import { PostList } from "@/app/(public)/components/PostList.server";

export default async function Home() {
  const [posts, tags] = await Promise.all([getPosts(), getTags()]);

  const postListsByKey: Record<string, React.ReactNode> = {
    all: <PostList posts={posts} />,
  };
  for (const tag of tags) {
    const postsForTag = posts.filter((post) =>
      post.tags.some((t) => t.id === tag.id)
    );
    postListsByKey[String(tag.id)] = (
      <PostList key={tag.id} posts={postsForTag} />
    );
  }

  return <PostBrowser tags={tags} postListsByKey={postListsByKey} />;
}
