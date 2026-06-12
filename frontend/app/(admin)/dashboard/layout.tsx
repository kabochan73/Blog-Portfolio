import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { logout } from './actions'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')

  if (!token) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard/articles" className="text-xl font-bold text-gray-900 hover:text-gray-600">管理画面</Link>
          <nav className="flex items-center gap-6">
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
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
