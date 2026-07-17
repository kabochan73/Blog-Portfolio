import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sidebar } from "@/components/Sidebar.client";
import type { Tag } from "@/types";

const tags: Tag[] = [
  { id: 1, name: "React" },
  { id: 2, name: "Laravel" },
];

test("タグ一覧(すべて含む)を表示する", () => {
  render(<Sidebar tags={tags} selectedKey="all" onSelect={() => {}} />);

  expect(screen.getByRole("button", { name: "すべて" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "React" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Laravel" })).toBeInTheDocument();
});

test("タグボタンをクリックするとonSelectがそのidの文字列で呼ばれる", async () => {
  const user = userEvent.setup();
  const onSelect = jest.fn();

  render(<Sidebar tags={tags} selectedKey="all" onSelect={onSelect} />);

  await user.click(screen.getByRole("button", { name: "React" }));

  expect(onSelect).toHaveBeenCalledWith("1");
});

test("選択中のタグはfont-semibold、他は非選択スタイルになる", () => {
  render(<Sidebar tags={tags} selectedKey="1" onSelect={() => {}} />);

  expect(screen.getByRole("button", { name: "React" })).toHaveClass(
    "font-semibold"
  );
  expect(screen.getByRole("button", { name: "すべて" })).not.toHaveClass(
    "font-semibold"
  );
});
