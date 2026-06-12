import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import type { ApiResponse, Article, Tag } from '@/types'
import { AdminArticleList } from '../../_components/AdminArticleList'

export default async function DraftsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  const [{ data: articles }, { data: tags }] = await Promise.all([
    api.get<ApiResponse<Article[]>>('/admin/articles?status=draft', { token, cache: 'no-store' }),
    api.get<ApiResponse<Tag[]>>('/tags', { token, cache: 'no-store' }),
  ])

  return (
    <AdminArticleList
      articles={articles}
      tags={tags}
      emptyText="下書きはありません。"
      placeholder="下書きを検索..."
      dateField="created_at"
    />
  )
}
