'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { api } from '@/lib/api'

export async function logout(): Promise<void> {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  try {
    await api.post('/logout', {}, { token })
  } catch {
    // トークンが無効でもCookieは削除してログアウト
  }

  cookieStore.delete('token')
  redirect('/login')
}
