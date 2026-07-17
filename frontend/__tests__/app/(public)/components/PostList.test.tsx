import { render, screen } from "@testing-library/react";
import { PostList } from "@/app/(public)/components/PostList";
import type { Post } from "@/types";

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: 1,
    title: "テスト記事",
    slug: "test-post",
    body: "本文",
    status: "published",
    tags: [],
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

test("記事がない場合は空メッセージを表示する", () => {
  render(<PostList posts={[]} />);

  expect(screen.getByText("記事がありません。")).toBeInTheDocument();
});

test("記事のタイトルとタグを表示する", () => {
  const post = makePost({ tags: [{ id: 1, name: "React" }] });

  render(<PostList posts={[post]} />);

  expect(screen.getByText("テスト記事")).toBeInTheDocument();
  expect(screen.getByText("React")).toBeInTheDocument();
});

test("デフォルトのリンク先は /posts/{slug} になる", () => {
  const post = makePost();

  render(<PostList posts={[post]} />);

  expect(screen.getByRole("link")).toHaveAttribute("href", "/posts/test-post");
});

test("getHrefでリンク先を差し替えられる", () => {
  const post = makePost();

  render(<PostList posts={[post]} getHref={(p) => `/admin/drafts/${p.id}`} />);

  expect(screen.getByRole("link")).toHaveAttribute("href", "/admin/drafts/1");
});
