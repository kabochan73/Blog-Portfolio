"use client";

import { useState } from "react";
import type { Tag } from "@/types";
import { Sidebar } from "@/components/Sidebar.client";

export function PostBrowser({
  tags,
  postListsByKey,
}: {
  tags: Tag[];
  postListsByKey: Record<string, React.ReactNode>;
}) {
  const [selectedKey, setSelectedKey] = useState("all");

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="order-2 sm:order-1 sm:flex-3">
        {postListsByKey[selectedKey]}
      </div>
      <Sidebar tags={tags} selectedKey={selectedKey} onSelect={setSelectedKey} />
    </div>
  );
}
