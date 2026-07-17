"use client";

import { AdminPostBrowser } from "@/app/admin/components/AdminPostBrowser.client";

export default function AdminDraftsPage() {
  return (
    <AdminPostBrowser
      statusFilter={(post) => post.status === "draft"}
      getTitleHref={(post) => `/admin/drafts/${post.id}`}
    />
  );
}
