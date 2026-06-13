'use client'

import type { Tag } from '@/types'

type Props = {
  query: string
  selectedTag: number | null
  tags: Tag[]
  placeholder?: string
  onQueryChange: (value: string) => void
  onTagClick: (tagId: number) => void
}

function Input({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white ${className}`}
      {...props}
    />
  )
}

function TagFilterButton({
  tag,
  isActive,
  onClick,
}: {
  tag: Tag
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
        isActive
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 hover:text-gray-900'
      }`}
    >
      {tag.name}
    </button>
  )
}

export function FilterSidebar({
  query,
  selectedTag,
  tags,
  placeholder,
  onQueryChange,
  onTagClick,
}: Props) {
  return (
    <aside className="w-full">
      <Input
        type="search"
        value={query}
        placeholder={placeholder ?? '記事を検索...'}
        onChange={(e) => onQueryChange(e.target.value)}
        className="w-full mb-6 hover:border-gray-400"
      />
      {tags.length === 0 ? (
        <p className="text-xs text-gray-400">タグがありません</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagFilterButton
              key={tag.id}
              tag={tag}
              isActive={selectedTag === tag.id}
              onClick={() => onTagClick(tag.id)}
            />
          ))}
        </div>
      )}
    </aside>
  )
}
