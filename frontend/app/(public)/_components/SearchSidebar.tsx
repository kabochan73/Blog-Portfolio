'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import type { Tag } from '@/types'
import { FilterSidebar } from '@/app/_components/FilterSidebar'

type Props = {
  tags: Tag[]
}

export function SearchSidebar({ tags }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const query = searchParams.get('q') ?? ''
  const selectedTag = searchParams.get('tag') ? Number(searchParams.get('tag')) : null

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString())
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    const qs = params.toString()
    router.replace(qs ? `?${qs}` : '/')
  }

  return (
    <div className="md:w-56 md:shrink-0 md:sticky md:top-8 md:self-start">
      <FilterSidebar
        query={query}
        selectedTag={selectedTag}
        tags={tags}
        onQueryChange={(q) => updateParams({ q })}
        onTagClick={(tagId) => updateParams({ tag: selectedTag === tagId ? null : String(tagId) })}
      />
    </div>
  )
}
