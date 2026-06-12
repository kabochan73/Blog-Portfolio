'use client'

import { useActionState, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import { createArticle, updateArticle, type ArticleActionState } from './actions'
import type { Article, Tag } from '@/types'

type Props = {
  tags: Tag[]
  article?: Article
}

export function ArticleForm({ tags, article }: Props) {
  const action = article ? updateArticle.bind(null, article.id) : createArticle
  const [state, formAction, isPending] = useActionState<ArticleActionState, FormData>(action, null)
  const [isPreview, setIsPreview] = useState(false)
  const [content, setContent] = useState(article?.content ?? '')

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-md">{state.error}</p>
      )}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          タイトル <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={50}
          defaultValue={article?.title}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <label htmlFor="content" className="text-sm font-medium text-gray-700">
            本文 <span className="text-red-500">*</span>
          </label>
          <div className="flex rounded-md border border-gray-300 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setIsPreview(false)}
              className={`px-3 py-1 transition-colors ${
                !isPreview ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              編集
            </button>
            <button
              type="button"
              onClick={() => setIsPreview(true)}
              className={`px-3 py-1 transition-colors ${
                isPreview ? 'bg-gray-900 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              プレビュー
            </button>
          </div>
        </div>
        {isPreview ? (
          <div className="w-full min-h-96 border border-gray-300 rounded-md px-3 py-2 bg-white prose prose-gray max-w-none">
            {content ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {content}
              </ReactMarkdown>
            ) : (
              <p className="text-gray-400 text-sm">本文がありません</p>
            )}
          </div>
        ) : (
          <textarea
            id="content"
            name="content"
            required
            rows={16}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Markdown で書けます"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          />
        )}
        {isPreview && <input type="hidden" name="content" value={content} />}
      </div>
      {tags.length > 0 && (
        <div>
          <p className="block text-sm font-medium text-gray-700 mb-2">タグ</p>
          <div className="flex flex-wrap gap-3">
            {tags.map((tag) => (
              <label key={tag.id} className="flex items-center gap-1.5 text-sm text-gray-700">
                <input
                  type="checkbox"
                  name="tags"
                  value={tag.id}
                  defaultChecked={article?.tags.some((t) => t.id === tag.id)}
                />
                {tag.name}
              </label>
            ))}
          </div>
        </div>
      )}
      <div className="flex items-end justify-between">
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            ステータス <span className="text-red-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            defaultValue={article?.status ?? 'draft'}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400 bg-white"
          >
            <option value="draft">下書き</option>
            <option value="published">公開</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isPending}
            className="text-sm px-6 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-700 disabled:opacity-50"
          >
            {isPending ? '保存中...' : '保存'}
          </button>
          <a
            href="/dashboard/articles"
            className="text-sm px-6 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
          >
            キャンセル
          </a>
        </div>
      </div>
    </form>
  )
}
