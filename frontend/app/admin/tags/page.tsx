"use client";

import { useEffect, useState } from "react";
import {
  listAdminTags,
  createTag,
  updateTag,
  deleteTag,
} from "@/lib/api.tags.client";
import { revalidatePublicCache, ApiError } from "@/lib/api.client";
import type { Tag } from "@/types";

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    listAdminTags()
      .then(setTags)
      .catch((e) =>
        setLoadError(e instanceof Error ? e.message : "読み込みに失敗しました")
      );
  }, []);

  const handleCreate = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setCreateError(null);
    try {
      const tag = await createTag(newName);
      setTags((prev) =>
        [...(prev ?? []), tag].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewName("");
      await revalidatePublicCache();
    } catch (err) {
      setCreateError(
        err instanceof ApiError
          ? (err.errors?.name?.[0] ?? err.message)
          : "作成に失敗しました"
      );
    }
  };

  const startEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
    setEditError(null);
  };

  const handleUpdate = async (id: number) => {
    setEditError(null);
    try {
      const tag = await updateTag(id, editingName);
      setTags((prev) => prev?.map((t) => (t.id === id ? tag : t)) ?? null);
      setEditingId(null);
      await revalidatePublicCache();
    } catch (err) {
      setEditError(
        err instanceof ApiError
          ? (err.errors?.name?.[0] ?? err.message)
          : "更新に失敗しました"
      );
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("このタグを削除しますか？")) return;
    setDeleteError(null);
    try {
      await deleteTag(id);
      setTags((prev) => prev?.filter((t) => t.id !== id) ?? null);
      await revalidatePublicCache();
    } catch (err) {
      setDeleteError(
        err instanceof Error ? err.message : "削除に失敗しました"
      );
    }
  };

  if (loadError) {
    return <p className="text-red-600">{loadError}</p>;
  }

  if (!tags) {
    return <p>読み込み中...</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="新しいタグ名"
          className="border border-zinc-300 px-2 py-1"
        />
        <button type="submit" className="bg-black px-4 py-1 text-white">
          追加
        </button>
      </form>
      {createError && <p className="text-sm text-red-600">{createError}</p>}
      {deleteError && <p className="text-sm text-red-600">{deleteError}</p>}

      {tags.length === 0 ? (
        <p className="text-zinc-500">タグがありません。</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tags.map((tag) => (
            <li
              key={tag.id}
              className="flex items-center justify-between border-b border-zinc-200 py-2"
            >
              {editingId === tag.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    className="border border-zinc-300 px-2 py-1"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdate(tag.id)}
                    className="text-sm underline"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-sm text-zinc-500"
                  >
                    キャンセル
                  </button>
                  {editError && (
                    <p className="text-sm text-red-600">{editError}</p>
                  )}
                </div>
              ) : (
                <>
                  <span>{tag.name}</span>
                  <div className="flex gap-3 text-sm">
                    <button
                      type="button"
                      onClick={() => startEdit(tag)}
                      className="underline"
                    >
                      編集
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(tag.id)}
                      className="text-red-600"
                    >
                      削除
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
