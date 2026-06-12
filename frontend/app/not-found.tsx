import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-6xl font-bold text-gray-900 mb-4">404</p>
        <p className="text-gray-500 mb-8">ページが見つかりませんでした。</p>
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 underline">
          トップに戻る
        </Link>
      </div>
    </div>
  )
}
