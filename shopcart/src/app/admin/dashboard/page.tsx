
"use client";

import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  IndianRupee,
  PackageCheck,
  Users,
} from "lucide-react";

import AdminRoute from "@/app/components/auth/AdminRoute";
import { useGetDashboardQuery } from "@/app/store/api/adminApi";

import styles from "./AdminDashboard.module.css";

const formatCurrency = (
  value: number
): string => {
  if (!Number.isFinite(value)) {
    return "₹0";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (
  date?: string
): string => {
  if (!date) {
    return "Date unavailable";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

const getOrderStatusLabel = (
  status: string
): string => {
  switch (status) {
    case "PLACED":
      return "Placed";

    case "CONFIRMED":
      return "Confirmed";

    case "SHIPPED":
      return "Shipped";

    case "DELIVERED":
      return "Delivered";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
};

const getOrderStatusClass = (): string => {
  return styles.status;
};

export default function AdminDashboardPage() {
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetDashboardQuery();

  const dashboard = data?.dashboard;

  const recentOrders =
    dashboard &&
    Array.isArray(dashboard.recentOrders)
      ? dashboard.recentOrders
      : [];

  const recentUsers =
    dashboard &&
    Array.isArray(dashboard.recentUsers)
      ? dashboard.recentUsers
      : [];

const totalProducts = dashboard?.totalProducts ?? 0;
const activeProducts = dashboard?.activeProducts ?? 0;
const inactiveProducts = Math.max(totalProducts - activeProducts, 0);

const totalRevenue = dashboard?.totalRevenue ?? 0;
const totalOrders = dashboard?.totalOrders ?? 0;
const pendingOrders = dashboard?.pendingOrders ?? 0;
const totalUsers = dashboard?.totalUsers ?? 0;
const lowStockProducts = dashboard?.lowStockProducts ?? 0;

  return (
    <AdminRoute>
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div>
              <p className={styles.eyebrow}>
                Administration
              </p>

              <h1>Store overview</h1>

              <p>
                Monitor orders, inventory, and
                customers from one place.
              </p>
            </div>

            <Link
              className={styles.primaryAction}
              href="/admin/products"
            >
              Add product

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          </header>

          {isLoading && (
            <section
              className={styles.state}
              role="status"
              aria-live="polite"
              aria-busy="true"
            >
              Loading dashboard...
            </section>
          )}

          {!isLoading && isError && (
            <section
              className={styles.state}
              role="alert"
              aria-labelledby="dashboard-error-title"
            >
              <p id="dashboard-error-title">
                Could not load the dashboard.
              </p>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching
                  ? "Retrying..."
                  : "Try again"}
              </button>
            </section>
          )}

          {!isLoading &&
            !isError &&
            !dashboard && (
              <section
                className={styles.state}
                role="status"
              >
                <p>
                  Dashboard data is currently
                  unavailable.
                </p>

                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  {isFetching
                    ? "Loading..."
                    : "Refresh"}
                </button>
              </section>
            )}

          {dashboard && (
            <>
              <section
                className={styles.metrics}
                aria-labelledby="dashboard-metrics-title"
              >
                <h2
                  id="dashboard-metrics-title"
                  className={
                    styles.visuallyHidden
                  }
                >
                  Store metrics
                </h2>

                <Metric
                  icon={
                    <IndianRupee
                      aria-hidden="true"
                    />
                  }
                  label="Revenue"
                  value={formatCurrency(
                    totalRevenue
                  )}
                  detail="Excluding cancelled orders"
                />

                <Metric
                  icon={
                    <PackageCheck
                      aria-hidden="true"
                    />
                  }
                  label="Total orders"
                  value={String(
                    totalOrders
                  )}
                  detail={`${pendingOrders} currently in progress`}
                />

                <Metric
                  icon={
                    <Users
                      aria-hidden="true"
                    />
                  }
                  label="Customers"
                  value={String(
                    totalUsers
                  )}
                  detail="Registered accounts"
                />

                <Metric
                  icon={
                    <Box
                      aria-hidden="true"
                    />
                  }
                  label="Active products"
                  value={String(
                    activeProducts
                  )}
                  detail={`${inactiveProducts} inactive`}
                />
              </section>

              <section
                className={styles.alerts}
                aria-label="Inventory alerts"
              >
                <div>
                  <AlertTriangle
                    size={20}
                    aria-hidden="true"
                  />

                  <span>
                    <strong>
                      {lowStockProducts}
                    </strong>{" "}
                    active products have
                    five or fewer items left.
                  </span>
                </div>

                <Link
                  href="/admin/products"
                  aria-label="Review low-stock inventory"
                >
                  Review inventory

                  <ArrowRight
                    size={15}
                    aria-hidden="true"
                  />
                </Link>
              </section>

              <section
                className={styles.grid}
                aria-label="Dashboard activity"
              >
                <Panel
                  title="Recent orders"
                  subtitle="Latest customer purchases"
                  href="/admin/orders"
                  link="All orders"
                >
                  {recentOrders.length >
                  0 ? (
                    recentOrders.map(
                      (order) => (
                        <Link
                          href={`/admin/orders/${order._id}`}
                          className={styles.row}
                          key={order._id}
                          aria-label={`View order ${order._id}`}
                        >
                          <span>
                            <strong>
                              {order.user
                                ?.name ??
                                "Deleted customer"}
                            </strong>

                            <small>
                              {formatDate(
                                order.createdAt
                              )}
                            </small>
                          </span>

                          <span>
                            <strong>
                              {formatCurrency(
                                order.totalAmount
                              )}
                            </strong>

                            <small
                              className={getOrderStatusClass()}
                              
                            >
                              {getOrderStatusLabel(
                                order.orderStatus
                              )}
                            </small>
                          </span>
                        </Link>
                      )
                    )
                  ) : (
                    <p
                      className={
                        styles.empty
                      }
                    >
                      No orders yet.
                    </p>
                  )}
                </Panel>

                <Panel
                  title="New customers"
                  subtitle="Recently registered accounts"
                  href="/admin/users"
                  link="All users"
                >
                  {recentUsers.length >
                  0 ? (
                    recentUsers.map(
                      (user) => (
                        <div
                          className={
                            styles.row
                          }
                          key={user._id}
                        >
                          <span>
                            <strong>
                              {user.name ||
                                "Unnamed user"}
                            </strong>

                            <small>
                              {user.email}
                            </small>
                          </span>

                          <small
                            className={
                              styles.role
                            }
                          >
                            {user.role}
                          </small>
                        </div>
                      )
                    )
                  ) : (
                    <p
                      className={
                        styles.empty
                      }
                    >
                      No customers yet.
                    </p>
                  )}
                </Panel>
              </section>

              <section
                className={styles.actions}
                aria-labelledby="management-title"
              >
                <h2 id="management-title">
                  Management
                </h2>

                <div>
                  <Link href="/admin/orders">
                    Manage orders

                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                    />
                  </Link>

                  <Link href="/admin/products">
                    Manage products

                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                    />
                  </Link>

                  <Link href="/admin/users">
                    Manage users

                    <ArrowRight
                      size={16}
                      aria-hidden="true"
                    />
                  </Link>
                </div>
              </section>
            </>
          )}
        </div>
      </main>
    </AdminRoute>
  );
}

interface MetricProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}

function Metric({
  icon,
  label,
  value,
  detail,
}: MetricProps) {
  return (
    <article className={styles.metric}>
      <span
        className={styles.metricIcon}
        aria-hidden="true"
      >
        {icon}
      </span>

      <p>{label}</p>

      <strong>{value}</strong>

      <small>{detail}</small>
    </article>
  );
}

interface PanelProps {
  title: string;
  subtitle: string;
  href: string;
  link: string;
  children: React.ReactNode;
}

function Panel({
  title,
  subtitle,
  href,
  link,
  children,
}: PanelProps) {
  return (
    <article className={styles.panel}>
      <div className={styles.panelHeader}>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        <Link href={href}>
          {link}
        </Link>
      </div>

      <div className={styles.list}>
        {children}
      </div>
    </article>
  );
}


