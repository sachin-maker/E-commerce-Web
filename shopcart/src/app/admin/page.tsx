"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import AdminRoute from "@/app/components/auth/AdminRoute";
import styles from "./AdminPages.module.css";

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <AdminRoute>
      <main className={styles.page}>
        <p
          className={styles.state}
          role="status"
          aria-live="polite"
        >
          Opening admin dashboard...
        </p>
      </main>
    </AdminRoute>
  );
}
