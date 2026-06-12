import { Fragment } from 'react'
import Link from 'next/link'
import type { Article, Tag } from '@/types'

type Props = {
  article: Article
  href: string
  dateField?: 'published_at' | 'created_at'
  renderTag: (tag: Tag) => React.ReactNode
  actions?: React.ReactNode
}

export function ArticleCard({
  article,
  href,
  dateField = 'published_at',
  renderTag,
  actions,
}: Props) {
  return (
    <li className="relative bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:border-gray-400 transition-colors">
      <Link href={href} className="after:absolute after:inset-0">
        <h2 className="text-xl font-semibold text-gray-900 mb-3">{article.title}</h2>
      </Link>
      <div className={`relative z-10 flex items-center ${actions ? 'justify-between' : ''}`}>
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-sm text-gray-500">
            {article[dateField]
              ? new Date(article[dateField]).toLocaleDateString('ja-JP')
              : '—'}
          </p>
          {article.tags.map((tag) => (
            <Fragment key={tag.id}>{renderTag(tag)}</Fragment>
          ))}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </li>
  )
}
