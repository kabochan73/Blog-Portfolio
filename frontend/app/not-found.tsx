import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-full w-full flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
      <p className="text-sm font-medium text-zinc-500">404</p>
      <h1 className="text-2xl font-bold tracking-tight">
        ページが見つかりません
      </h1>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-zinc-800"
      >
        トップに戻る
      </Link>
    </div>
  );
}
