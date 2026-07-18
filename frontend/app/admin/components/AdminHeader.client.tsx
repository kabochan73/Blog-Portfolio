"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/lib/api.client";

export function AdminHeader() {
  const router = useRouter();

  return (
    <header className="border-b border-zinc-200 font-bold">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link href="/admin" className="text-2xl font-bold hover:text-zinc-500">
          Blog
        </Link>
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Link href="/admin/drafts">下書き</Link>
          <Link href="/admin/tags">タグ</Link>
          <Link
            href="/admin/posts/new"
            className="bg-black px-3 py-1 text-white"
          >
            新規作成
          </Link>
          <button
            type="button"
            onClick={async () => {
              await logout();
              router.push("/");
            }}
            className="text-zinc-500 hover:text-zinc-900"
          >
            ログアウト
          </button>
        </div>
      </div>
    </header>
  );
}
