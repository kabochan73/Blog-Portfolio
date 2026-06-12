import Link from 'next/link'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { api } from '@/lib/api'
import type { ApiResponse, Article } from '@/types'

export async function generateStaticParams() {
  return []
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  let article: Article

  try {
    const res = await api.get<ApiResponse<Article>>(`/articles/${slug}`, {
      next: { tags: ['articles'] },
    })
    article = res.data
  } catch {
    notFound()
  }

  return (
    <div>
      <article className="bg-white rounded-lg border border-gray-200 shadow-sm p-8">
        <header className="mb-8 pb-8 border-b border-gray-400">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{article.title}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <p className="text-sm text-gray-500">
              {article.published_at
                ? new Date(article.published_at).toLocaleDateString('ja-JP')
                : ''}
            </p>
            {article.tags.map((tag) => (
              <span
                key={tag.id}
                className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full"
              >
                {tag.name}
              </span>
            ))}
          </div>
        </header>
        <div className="prose prose-gray max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
            {article.content}
          </ReactMarkdown>
        </div>
      </article>
      <div className="flex justify-end mt-6">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-900">
          記事一覧に戻る
        </Link>
      </div>
    </div>
  )
}
