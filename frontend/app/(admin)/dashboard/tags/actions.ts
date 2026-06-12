'use server'

import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { api } from '@/lib/api'

export type TagActionState = {
  error?: string
} | null

async function getToken(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get('token')?.value
}

function revalidateTagCache() {
  revalidatePath('/')
  revalidatePath('/dashboard/tags')
}

export async function createTag(
  _prevState: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const token = await getToken()

  try {
    await api.post('/admin/tags', { name: formData.get('name') }, { token })
  } catch {
    return { error: 'タグの作成に失敗しました。' }
  }

  revalidateTagCache()
  return null
}

export async function updateTag(
  id: number,
  _prevState: TagActionState,
  formData: FormData,
): Promise<TagActionState> {
  const token = await getToken()

  try {
    await api.put(`/admin/tags/${id}`, { name: formData.get('name') }, { token })
  } catch {
    return { error: 'タグの更新に失敗しました。' }
  }

  revalidateTagCache()
  return null
}

export async function deleteTag(id: number): Promise<void> {
  const token = await getToken()
  await api.delete(`/admin/tags/${id}`, { token })
  revalidateTagCache()
}
