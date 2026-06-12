import { cookies } from 'next/headers'
import { api } from '@/lib/api'
import type { ApiResponse, Tag } from '@/types'
import { TagList } from './TagList'

export default async function AdminTagsPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  const { data: tags } = await api.get<ApiResponse<Tag[]>>('/admin/tags', {
    token,
    cache: 'no-store',
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">タグ管理</h1>
      <TagList tags={tags} />
    </div>
  )
}
