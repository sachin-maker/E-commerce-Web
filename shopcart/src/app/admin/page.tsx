"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import AdminRoute from "@/app/components/auth/AdminRoute";
import { useAppSelector } from "@/app/store/hooks";
import {
  DashboardStats,
  getDashboardStats,
} from "@/services/adminService";

export default function AdminPage() {
  const { token } = useAppSelector((state) => state.auth);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (!token) return;

      try {
        const response = await getDashboardStats(token);
        setStats(response.stats);
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, [token]);

  return (
    <AdminRoute>
      <main className="min-h-screen bg-gray-50 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">
            Admin Dashboard
          </h1>

          <p className="mb-8 text-gray-600">
            Manage users, products, and orders.
          </p>

          {loading ? (
            <div className="rounded-xl bg-white p-8 text-center shadow-sm">
              Loading dashboard...
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-sm text-gray-500">
                  Total Users
                </h2>

                <p className="mt-2 text-3xl font-bold">
                  {stats?.totalUsers ?? 0}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-sm text-gray-500">
                  Total Products
                </h2>

                <p className="mt-2 text-3xl font-bold">
                  {stats?.totalProducts ?? 0}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-sm text-gray-500">
                  Total Orders
                </h2>

                <p className="mt-2 text-3xl font-bold">
                  {stats?.totalOrders ?? 0}
                </p>
              </div>

              <div className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-sm text-gray-500">
                  Total Revenue
                </h2>

                <p className="mt-2 text-3xl font-bold">
                  ₹{stats?.totalRevenue ?? 0}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </AdminRoute>
  );
}