'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="py-20 text-center">
      <p className="text-gray-500 mb-4">ページの読み込みに失敗しました。</p>
      {error.digest && (
        <p className="text-xs text-gray-400 mb-4">digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="px-4 py-2 text-sm bg-gray-900 text-white rounded hover:bg-gray-700"
      >
        再試行
      </button>
    </div>
  )
}
