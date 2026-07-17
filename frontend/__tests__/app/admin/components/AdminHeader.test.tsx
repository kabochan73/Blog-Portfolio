import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AdminHeader } from "@/app/admin/components/AdminHeader.client";

const push = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

jest.mock("@/lib/api.client", () => ({
  logout: jest.fn().mockResolvedValue(undefined),
}));

test("ナビゲーションリンクを表示する", () => {
  render(<AdminHeader />);

  expect(screen.getByRole("link", { name: "下書き" })).toHaveAttribute(
    "href",
    "/admin/drafts"
  );
  expect(screen.getByRole("link", { name: "タグ" })).toHaveAttribute(
    "href",
    "/admin/tags"
  );
  expect(screen.getByRole("link", { name: "新規作成" })).toHaveAttribute(
    "href",
    "/admin/posts/new"
  );
});

test("ログアウトボタンでpublicページへ遷移し、logout()が呼ばれる", async () => {
  const user = userEvent.setup();
  const { logout } = jest.requireMock("@/lib/api.client");

  render(<AdminHeader />);

  await user.click(screen.getByRole("button", { name: "ログアウト" }));

  expect(push).toHaveBeenCalledWith("/");
  expect(logout).toHaveBeenCalled();
});
