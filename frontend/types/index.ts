export type ArticleStatus = 'draft' | 'published'

export type Tag = {
  id: number
  name: string
  slug: string
}

export type Article = {
  id: number
  title: string
  content: string
  slug: string
  status: ArticleStatus
  published_at: string | null
  tags: Tag[]
  created_at: string
  updated_at: string
}

export type ApiResponse<T> = {
  data: T
}
