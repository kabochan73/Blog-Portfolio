'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Tag } from '@/types'
import { FilterSidebar } from '@/app/_components/FilterSidebar'

type Props = {
  tags: Tag[]
}

export function SearchSidebar({ tags }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const urlQuery = searchParams.get('q') ?? ''
  const selectedTag = searchParams.get('tag') ? Number(searchParams.get('tag')) : null

  const [query, setQuery] = useState(urlQuery)
  const [syncedUrlQuery, setSyncedUrlQuery] = useState(urlQuery)
  if (urlQuery !== syncedUrlQuery) {
    setSyncedUrlQuery(urlQuery)
    setQuery(urlQuery)
  }

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

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query !== urlQuery) {
        updateParams({ q: query })
      }
    }, 300)
    return () => clearTimeout(timeout)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  return (
    <div className="md:w-56 md:shrink-0 md:sticky md:top-8 md:self-start">
      <FilterSidebar
        query={query}
        selectedTag={selectedTag}
        tags={tags}
        onQueryChange={setQuery}
        onTagClick={(tagId) => updateParams({ tag: selectedTag === tagId ? null : String(tagId) })}
      />
    </div>
  )
}
