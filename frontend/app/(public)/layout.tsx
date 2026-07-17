import Link from "next/link";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-4xl items-center px-4 py-4">
          <Link href="/" className="text-2xl font-bold hover:text-zinc-500">
            Blog
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {children}
      </main>
    </>
  );
}
