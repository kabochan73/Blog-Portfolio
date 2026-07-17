"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/app/admin/components/AdminHeader.client";
import { useAuthToken } from "@/lib/auth.client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = useAuthToken();
  const router = useRouter();

  useEffect(() => {
    if (token === null) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) {
    return null;
  }

  return (
    <>
      <AdminHeader />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        {children}
      </main>
    </>
  );
}
