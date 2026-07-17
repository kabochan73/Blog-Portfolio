import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PostBrowser } from "@/app/(public)/components/PostBrowser.client";
import type { Tag } from "@/types";

const tags: Tag[] = [{ id: 1, name: "React" }];

test("selectedKeyに応じてpostListsByKeyの中身を出し分ける", async () => {
  const user = userEvent.setup();

  render(
    <PostBrowser
      tags={tags}
      postListsByKey={{
        all: <p>全件の一覧</p>,
        "1": <p>Reactの一覧</p>,
      }}
    />
  );

  expect(screen.getByText("全件の一覧")).toBeInTheDocument();
  expect(screen.queryByText("Reactの一覧")).not.toBeInTheDocument();

  await user.click(screen.getByRole("button", { name: "React" }));

  expect(screen.getByText("Reactの一覧")).toBeInTheDocument();
  expect(screen.queryByText("全件の一覧")).not.toBeInTheDocument();
});
