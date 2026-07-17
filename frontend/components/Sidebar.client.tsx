"use client";

import type { Tag } from "@/types";

export function Sidebar({
  tags,
  selectedKey,
  onSelect,
}: {
  tags: Tag[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <aside className="flex-1">
      <ul className="flex flex-col">
        <li className="border-b border-zinc-400">
          <button
            type="button"
            onClick={() => onSelect("all")}
            className={`block w-full p-2 text-left hover:bg-gray-50 ${
              selectedKey === "all"
                ? "font-semibold"
                : "text-zinc-500 hover:text-zinc-900"
            }`}
          >
            すべて
          </button>
        </li>
        {tags.map((tag) => (
          <li key={tag.id} className="border-b border-zinc-400">
            <button
              type="button"
              onClick={() => onSelect(String(tag.id))}
              className={`block w-full p-2 text-left hover:bg-gray-50 ${
                selectedKey === String(tag.id)
                  ? "font-semibold"
                  : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              {tag.name}
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
