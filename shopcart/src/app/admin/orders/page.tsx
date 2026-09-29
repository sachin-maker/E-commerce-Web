
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import AdminRoute from "@/app/components/auth/AdminRoute";
import {
  type AdminOrder,
  useGetAdminOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/app/store/api/adminApi";
import { getApiErrorMessage } from "@/lib/apiError";
import styles from "../AdminPages.module.css";

const statuses: AdminOrder["orderStatus"][] = [
  "PLACED",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const allowedTransitions: Record<
  AdminOrder["orderStatus"],
  AdminOrder["orderStatus"][]
> = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

const formatCurrency = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safeValue);
};

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatStatus = (
  status: AdminOrder["orderStatus"],
): string => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

const getOrderIdLabel = (id: string): string => {
  return id.length > 8 ? id.slice(-8) : id;
};

export default function AdminOrdersPage() {
  const [page, setPage] = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(
    null,
  );

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAdminOrdersQuery({
    page,
    limit: 20,
  });

  const [updateStatus] = useUpdateOrderStatusMutation();

  const totalPages = useMemo(
    () => Math.max(data?.pagination?.pages ?? 1, 1),
    [data?.pagination?.pages],
  );

  const orders = data?.orders ?? [];
  const hasOrders = orders.length > 0;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const changeStatus = async (
    order: AdminOrder,
    nextStatus: AdminOrder["orderStatus"],
  ) => {
    if (order.orderStatus === nextStatus) {
      return;
    }

    const validNextStatuses =
      allowedTransitions[order.orderStatus];

    if (!validNextStatuses.includes(nextStatus)) {
      toast.error(
        `Order cannot be changed from ${formatStatus(
          order.orderStatus,
        )} to ${formatStatus(nextStatus)}`,
      );

      return;
    }

    setUpdatingOrderId(order._id);

    try {
      await updateStatus({
        id: order._id,
        orderStatus: nextStatus,
      }).unwrap();

      toast.success(
        `Order status updated to ${formatStatus(nextStatus)}`,
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not update the order",
        ),
      );
    } finally {
      setUpdatingOrderId(null);
    }
  };

  return (
    <AdminRoute>
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div>
              <h1>Manage orders</h1>
              <p>
                Review customer orders, payment status, and
                fulfilment progress.
              </p>
            </div>

            <Link
              className={styles.link}
              href="/admin/dashboard"
            >
              Dashboard
            </Link>
          </header>

          {isLoading && (
            <section
              className={styles.state}
              role="status"
              aria-live="polite"
            >
              Loading orders...
            </section>
          )}

          {isError && !isLoading && (
            <section
              className={styles.error}
              role="alert"
            >
              <p>Unable to load orders.</p>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? "Retrying..." : "Try again"}
              </button>
            </section>
          )}

          {!isLoading && !isError && (
            <>
              <div className={styles.tableWrap}>
                {hasOrders ? (
                  <table className={styles.table}>
                    <caption className={styles.visuallyHidden}>
                      Admin order management table
                    </caption>

                    <thead>
                      <tr>
                        <th scope="col">Order</th>
                        <th scope="col">Customer</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Payment</th>
                        <th scope="col">Date</th>
                        <th scope="col">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => {
                        const availableStatuses = [
                          order.orderStatus,
                          ...allowedTransitions[
                            order.orderStatus
                          ],
                        ];

                        const uniqueStatuses = [
                          ...new Set(availableStatuses),
                        ];

                        const isUpdatingThisOrder =
                          updatingOrderId === order._id;

                        return (
                          <tr key={order._id}>
                            <td>
                              <Link
                                className={styles.orderLink}
                                href={`/admin/orders/${order._id}`}
                                aria-label={`View order ${order._id}`}
                              >
                                #{getOrderIdLabel(order._id)}
                              </Link>
                            </td>

                            <td>
                              <div className={styles.product}>
                                <strong>
                                  {order.user?.name ??
                                    "Deleted customer"}
                                </strong>

                                <small>
                                  {order.user?.email ??
                                    "Email unavailable"}
                                </small>
                              </div>
                            </td>

                            <td>
                              {formatCurrency(
                                order.totalAmount,
                              )}
                            </td>

                            <td>
                              <div className={styles.product}>
                                <strong>
                                  {order.paymentMethod}
                                </strong>

                                <small>
                                  {order.paymentStatus}
                                </small>
                              </div>
                            </td>

                            <td className={styles.muted}>
                              {formatDate(order.createdAt)}
                            </td>

                            <td>
                              <label
                                className={
                                  styles.visuallyHidden
                                }
                                htmlFor={`status-${order._id}`}
                              >
                                Update status for order{" "}
                                {order._id}
                              </label>

                              <select
                                id={`status-${order._id}`}
                                className={styles.select}
                                disabled={
                                  isUpdatingThisOrder
                                }
                                value={order.orderStatus}
                                onChange={(event) =>
                                  changeStatus(
                                    order,
                                    event.target
                                      .value as AdminOrder["orderStatus"],
                                  )
                                }
                                aria-busy={
                                  isUpdatingThisOrder
                                }
                              >
                                {uniqueStatuses.map(
                                  (status) => (
                                    <option
                                      key={status}
                                      value={status}
                                    >
                                      {formatStatus(status)}
                                    </option>
                                  ),
                                )}
                              </select>

                              {isUpdatingThisOrder && (
                                <span
                                  className={
                                    styles.visuallyHidden
                                  }
                                  role="status"
                                  aria-live="polite"
                                >
                                  Updating order status...
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <p
                    className={styles.state}
                    role="status"
                  >
                    No orders found.
                  </p>
                )}
              </div>

              {totalPages > 1 && (
                <nav
                  className={styles.pagination}
                  aria-label="Order pagination"
                >
                  <button
                    type="button"
                    disabled={page <= 1 || isFetching}
                    onClick={() =>
                      setPage((currentPage) =>
                        Math.max(currentPage - 1, 1),
                      )
                    }
                  >
                    Previous
                  </button>

                  <span
                    className={styles.muted}
                    aria-live="polite"
                  >
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      page >= totalPages || isFetching
                    }
                    onClick={() =>
                      setPage((currentPage) =>
                        Math.min(
                          currentPage + 1,
                          totalPages,
                        ),
                      )
                    }
                  >
                    Next
                  </button>
                </nav>
              )}

              {isFetching && !isLoading && (
                <p
                  className={styles.visuallyHidden}
                  role="status"
                  aria-live="polite"
                >
                  Loading updated order data...
                </p>
              )}
            </>
          )}
        </div>
      </main>
    </AdminRoute>
  );
}


