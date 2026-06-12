import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { api } from '@/lib/api'
import type { ApiResponse, Article, Tag } from '@/types'
import { ArticleForm } from '../../../_components/ArticleForm'

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  let article: Article
  let tags: Tag[]

  try {
    const [articleRes, tagsRes] = await Promise.all([
      api.get<ApiResponse<Article>>(`/admin/articles/${id}`, { token, cache: 'no-store' }),
      api.get<ApiResponse<Tag[]>>('/tags', { token, cache: 'no-store' }),
    ])
    article = articleRes.data
    tags = tagsRes.data
  } catch {
    notFound()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">記事編集</h1>
      <ArticleForm tags={tags} article={article} />
    </div>
  )
}
