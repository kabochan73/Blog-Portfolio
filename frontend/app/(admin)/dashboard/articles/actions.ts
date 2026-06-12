'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath, revalidateTag } from 'next/cache'
import { api } from '@/lib/api'

export type ArticleActionState = {
  error?: string
} | null

async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('token')?.value
}

function revalidateArticleCache() {
  revalidateTag('articles', 'max')
  revalidatePath('/articles/[slug]', 'page')
}

export async function createArticle(
  _prevState: ArticleActionState,
  formData: FormData,
): Promise<ArticleActionState> {
  const token = await getToken()
  const tagIds = formData.getAll('tags').map(Number)

  try {
    await api.post(
      '/admin/articles',
      {
        title: formData.get('title'),
        content: formData.get('content'),
        status: formData.get('status'),
        tags: tagIds,
      },
      { token },
    )
  } catch {
    return { error: '記事の作成に失敗しました。' }
  }

  revalidateArticleCache()
  redirect('/dashboard/articles')
}

export async function updateArticle(
  id: number,
  _prevState: ArticleActionState,
  formData: FormData,
): Promise<ArticleActionState> {
  const token = await getToken()
  const tagIds = formData.getAll('tags').map(Number)

  try {
    await api.put(
      `/admin/articles/${id}`,
      {
        title: formData.get('title'),
        content: formData.get('content'),
        status: formData.get('status'),
        tags: tagIds,
      },
      { token },
    )
  } catch {
    return { error: '記事の更新に失敗しました。' }
  }

  revalidateArticleCache()
  redirect('/dashboard/articles')
}

export async function deleteArticle(id: number): Promise<void> {
  const token = await getToken()
  await api.delete(`/admin/articles/${id}`, { token })
  revalidateArticleCache()
  redirect('/dashboard/articles')
}
