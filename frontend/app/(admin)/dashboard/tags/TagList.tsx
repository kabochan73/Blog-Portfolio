'use client'

import { useActionState, useState } from 'react'
import { createTag, updateTag, deleteTag, type TagActionState } from './actions'
import type { Tag } from '@/types'

function CreateTagForm() {
  const [state, formAction, isPending] = useActionState<TagActionState, FormData>(createTag, null)

  return (
    <form action={formAction} className="flex gap-2 mb-8">
      <input
        name="name"
        type="text"
        required
        maxLength={50}
        placeholder="新しいタグ名"
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
      />
      <button
        type="submit"
        disabled={isPending}
        className="text-sm px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {isPending ? '追加中...' : '追加'}
      </button>
      {state?.error && <p className="text-sm text-red-600 self-center">{state.error}</p>}
    </form>
  )
}

function EditTagForm({ tag, onCancel }: { tag: Tag; onCancel: () => void }) {
  const action = updateTag.bind(null, tag.id)
  const [state, formAction, isPending] = useActionState<TagActionState, FormData>(action, null)

  return (
    <form action={formAction} className="flex gap-2">
      <input
        name="name"
        type="text"
        required
        maxLength={50}
        defaultValue={tag.name}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
      />
      <button
        type="submit"
        disabled={isPending}
        className="text-sm px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50"
      >
        {isPending ? '保存中...' : '保存'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-sm px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
      >
        キャンセル
      </button>
      {state?.error && <p className="text-sm text-red-600 self-center">{state.error}</p>}
    </form>
  )
}

export function TagList({ tags }: { tags: Tag[] }) {
  const [editingId, setEditingId] = useState<number | null>(null)

  return (
    <div>
      <CreateTagForm />
      {tags.length === 0 ? (
        <p className="text-gray-500">タグがまだありません。</p>
      ) : (
        <ul className="space-y-2">
          {tags.map((tag) => (
            <li key={tag.id} className="bg-white rounded-lg border border-gray-200 px-4 py-3">
              {editingId === tag.id ? (
                <EditTagForm tag={tag} onCancel={() => setEditingId(null)} />
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{tag.name}</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setEditingId(tag.id)}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      編集
                    </button>
                    <form action={deleteTag.bind(null, tag.id)}>
                      <button type="submit" className="text-sm text-red-600 hover:underline">
                        削除
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
