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
    <div className="flex gap-4">
      <div className="flex-3">{postListsByKey[selectedKey]}</div>
      <Sidebar tags={tags} selectedKey={selectedKey} onSelect={setSelectedKey} />
    </div>
  );
}
