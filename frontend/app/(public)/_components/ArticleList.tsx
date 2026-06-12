import Link from 'next/link'
import type { Article } from '@/types'
import { ArticleCard } from '@/app/_components/ArticleCard'

type Props = {
  articles: Article[]
  selectedTag: number | null
  query: string
}

export function ArticleList({ articles, selectedTag, query }: Props) {
  if (articles.length === 0) {
    return (
      <p className="text-gray-500">
        {query || selectedTag ? '条件に一致する記事がありません。' : '記事がまだありません。'}
      </p>
    )
  }

  return (
    <ul className="space-y-6">
      {articles.map((article) => (
        <ArticleCard
          key={article.id}
          article={article}
          href={`/articles/${article.slug}`}
          renderTag={(tag) => (
            <Link
              href={selectedTag === tag.id ? '/' : `?tag=${tag.id}`}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                selectedTag === tag.id
                  ? 'bg-gray-700 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tag.name}
            </Link>
          )}
        />
      ))}
    </ul>
  )
}
