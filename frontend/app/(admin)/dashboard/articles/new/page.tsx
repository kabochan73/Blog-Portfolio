import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import type { ApiResponse, Tag } from '@/types'
import { ArticleForm } from '../../_components/ArticleForm'

export default async function NewArticlePage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  const { data: tags } = await api.get<ApiResponse<Tag[]>>('/tags', {
    token,
    cache: 'no-store',
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">記事作成</h1>
      <ArticleForm tags={tags} />
    </div>
  )
}
