import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminPostList } from "@/app/admin/components/AdminPostList.client";
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
  render(<AdminPostList posts={[]} onDelete={() => {}} />);

  expect(screen.getByText("記事がありません。")).toBeInTheDocument();
});

test("ステータスとタグ、編集リンクを表示する", () => {
  const post = makePost({
    status: "draft",
    tags: [{ id: 1, name: "React" }],
  });

  render(<AdminPostList posts={[post]} onDelete={() => {}} />);

  expect(screen.getByText("下書き")).toBeInTheDocument();
  expect(screen.getByText("React")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "編集" })).toHaveAttribute(
    "href",
    "/admin/posts/1"
  );
});

test("getTitleHrefがない場合タイトルはリンクにならない", () => {
  const post = makePost();

  render(<AdminPostList posts={[post]} onDelete={() => {}} />);

  expect(screen.getByText("テスト記事")).toBeInTheDocument();
  expect(screen.getAllByRole("link")).toHaveLength(1);
});

test("getTitleHrefがある場合タイトルがリンクになる", () => {
  const post = makePost();

  render(
    <AdminPostList
      posts={[post]}
      onDelete={() => {}}
      getTitleHref={(p) => `/admin/drafts/${p.id}`}
    />
  );

  expect(screen.getByRole("link", { name: "テスト記事" })).toHaveAttribute(
    "href",
    "/admin/drafts/1"
  );
});

test("削除ボタンをクリックするとonDeleteがそのidで呼ばれる", async () => {
  const user = userEvent.setup();
  const onDelete = jest.fn();
  const post = makePost({ id: 42 });

  render(<AdminPostList posts={[post]} onDelete={onDelete} />);

  await user.click(screen.getByRole("button", { name: "削除" }));

  expect(onDelete).toHaveBeenCalledWith(42);
});
