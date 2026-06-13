'use client'

import { useState } from 'react'
import Link from 'next/link'
import { logout } from '../actions'

export function DashboardHeader() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/dashboard/articles"
          className="text-xl font-bold text-gray-900 hover:text-gray-600"
        >
          管理画面
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard/articles" className="text-sm text-gray-600 hover:text-gray-900">
            記事管理
          </Link>
          <Link href="/dashboard/articles/drafts" className="text-sm text-gray-600 hover:text-gray-900">
            下書き
          </Link>
          <Link href="/dashboard/tags" className="text-sm text-gray-600 hover:text-gray-900">
            タグ管理
          </Link>
          <Link
            href="/dashboard/articles/new"
            className="bg-gray-900 text-white text-sm px-4 py-2 rounded-md hover:bg-gray-700"
          >
            新規作成
          </Link>
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
              ログアウト
            </button>
          </form>
        </nav>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setIsOpen((v) => !v)}
          className="md:hidden p-2 text-gray-600 hover:text-gray-900"
          aria-label="メニュー"
        >
          {isOpen ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1">
            <Link
              href="/dashboard/articles"
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 py-2"
            >
              記事管理
            </Link>
            <Link
              href="/dashboard/articles/drafts"
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 py-2"
            >
              下書き
            </Link>
            <Link
              href="/dashboard/tags"
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 py-2"
            >
              タグ管理
            </Link>
            <Link
              href="/dashboard/articles/new"
              onClick={() => setIsOpen(false)}
              className="text-sm text-gray-600 hover:text-gray-900 py-2"
            >
              新規作成
            </Link>
            <form action={logout}>
              <button type="submit" className="text-sm text-gray-600 hover:text-gray-900 py-2">
                ログアウト
              </button>
            </form>
          </nav>
        </div>
      )}
    </header>
  )
}
