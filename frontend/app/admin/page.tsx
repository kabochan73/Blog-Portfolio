"use client";

import { AdminPostBrowser } from "@/app/admin/components/AdminPostBrowser.client";

export default function AdminDashboard() {
  return <AdminPostBrowser statusFilter={(post) => post.status === "published"} />;
}
