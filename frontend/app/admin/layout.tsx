"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/app/admin/components/AdminHeader.client";
import { checkAuth, consumeSessionExpired, useAuthState } from "@/lib/auth.client";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useAuthState();
  const router = useRouter();

  useEffect(() => {
    if (auth.status === "unknown") {
      checkAuth();
    }
  }, [auth.status]);

  useEffect(() => {
    if (auth.status === "guest") {
      router.replace(consumeSessionExpired() ? "/login?expired=1" : "/login");
    }
  }, [auth.status, router]);

  if (auth.status !== "authenticated") {
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
