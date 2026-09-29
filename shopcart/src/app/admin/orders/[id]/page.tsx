
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import AdminRoute from "@/app/components/auth/AdminRoute";
import {
  type AdminOrderDetails,
  useGetAdminOrderByIdQuery,
} from "@/app/store/api/adminApi";
import styles from "../../AdminPages.module.css";

const formatCurrency = (value: number): string => {
  const safeValue = Number.isFinite(value) ? value : 0;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safeValue);
};

const formatDate = (value?: string): string => {
  if (!value) {
    return "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatStatus = (
  status: AdminOrderDetails["orderStatus"],
): string => {
  return status.charAt(0) + status.slice(1).toLowerCase();
};

const getProductId = (
  product: AdminOrderDetails["items"][number]["product"],
): string => {
  return typeof product === "string" ? product : product._id;
};

const getAddressLine = (
  address: AdminOrderDetails["shippingAddress"],
): string => {
  return address.addressLine ?? address.address ?? "";
};

const getShortOrderId = (orderId: string): string => {
  return orderId.length > 8 ? orderId.slice(-8) : orderId;
};

const getItemQuantity = (
  quantity: number,
): number => {
  return Number.isFinite(quantity) && quantity > 0
    ? quantity
    : 0;
};

export default function AdminOrderDetailsPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAdminOrderByIdQuery(orderId, {
    skip: !orderId,
  });

  const order = data?.order;

  const addressLine = order
    ? getAddressLine(order.shippingAddress)
    : "";

  const totalItemQuantity =
    order?.items.reduce(
      (total, item) =>
        total + getItemQuantity(item.quantity),
      0,
    ) ?? 0;

  return (
    <AdminRoute>
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div>
              <h1>Order details</h1>

              <p>
                Order ID:{" "}
                <strong>
                  {order
                    ? getShortOrderId(order._id)
                    : orderId || "Unavailable"}
                </strong>
              </p>
            </div>

            <Link
              href="/admin/orders"
              className={styles.link}
            >
              Back to orders
            </Link>
          </header>

          {!orderId && (
            <section
              className={styles.error}
              role="alert"
            >
              <p>Invalid order ID.</p>

              <Link
                href="/admin/orders"
                className={styles.orderLink}
              >
                Back to orders
              </Link>
            </section>
          )}

          {orderId && isLoading && (
            <section
              className={styles.state}
              role="status"
              aria-live="polite"
            >
              Loading order details...
            </section>
          )}

          {orderId && isError && !isLoading && (
            <section
              className={styles.error}
              role="alert"
            >
              <p>
                Unable to load this order. It may not exist or
                you may not have permission to view it.
              </p>

              <div>
                <button
                  type="button"
                  onClick={() => refetch()}
                  disabled={isFetching}
                >
                  {isFetching ? "Retrying..." : "Try again"}
                </button>
              </div>

              <div>
                <Link
                  href="/admin/orders"
                  className={styles.orderLink}
                >
                  Back to orders
                </Link>
              </div>
            </section>
          )}

          {orderId && !isLoading && !isError && !order && (
            <section
              className={styles.state}
              role="status"
            >
              Order not found.
            </section>
          )}

          {order && (
            <>
              <section
                className={styles.detailGrid}
                aria-label="Order summary"
              >
                <article className={styles.detailCard}>
                  <h2>Order information</h2>

                  <dl className={styles.detailList}>
                    <div className={styles.detailRow}>
                      <dt>Order ID</dt>
                      <dd>
                        <span title={order._id}>
                          #{getShortOrderId(order._id)}
                        </span>
                      </dd>
                    </div>

                    <div className={styles.detailRow}>
                      <dt>Customer</dt>
                      <dd>
                        {order.user?.name ??
                          "Deleted customer"}
                      </dd>
                    </div>

                    <div className={styles.detailRow}>
                      <dt>Email</dt>
                      <dd>
                        {order.user?.email ??
                          "Email unavailable"}
                      </dd>
                    </div>

                    <div className={styles.detailRow}>
                      <dt>Status</dt>
                      <dd>
                        <span className={styles.badge}>
                          {formatStatus(order.orderStatus)}
                        </span>
                      </dd>
                    </div>

                    <div className={styles.detailRow}>
                      <dt>Payment method</dt>
                      <dd>{order.paymentMethod}</dd>
                    </div>

                    <div className={styles.detailRow}>
                      <dt>Payment status</dt>
                      <dd>{order.paymentStatus}</dd>
                    </div>

                    <div className={styles.detailRow}>
                      <dt>Created</dt>
                      <dd>
                        {formatDate(order.createdAt)}
                      </dd>
                    </div>

                    {order.updatedAt && (
                      <div className={styles.detailRow}>
                        <dt>Last updated</dt>
                        <dd>
                          {formatDate(order.updatedAt)}
                        </dd>
                      </div>
                    )}
                  </dl>
                </article>

                <article className={styles.detailCard}>
                  <h2>Shipping address</h2>

                  <address className={styles.address}>
                    <strong>
                      {order.shippingAddress?.fullName ||
                        "Name unavailable"}
                    </strong>

                    <span>
                      {order.shippingAddress?.phone ||
                        "Phone unavailable"}
                    </span>

                    {addressLine && (
                      <span>{addressLine}</span>
                    )}

                    {(order.shippingAddress?.city ||
                      order.shippingAddress?.state) && (
                      <span>
                        {order.shippingAddress?.city || ""}
                        {order.shippingAddress?.city &&
                        order.shippingAddress?.state
                          ? ", "
                          : ""}
                        {order.shippingAddress?.state || ""}
                      </span>
                    )}

                    {order.shippingAddress?.postalCode && (
                      <span>
                        {order.shippingAddress.postalCode}
                      </span>
                    )}

                    {order.shippingAddress?.country && (
                      <span>
                        {order.shippingAddress.country}
                      </span>
                    )}
                  </address>
                </article>
              </section>

              <section
                className={styles.detailCard}
                aria-labelledby="ordered-products-title"
              >
                <div className={styles.detailCardHeader}>
                  <div>
                    <h2 id="ordered-products-title">
                      Ordered products
                    </h2>

                    <p>
                      {totalItemQuantity}{" "}
                      {totalItemQuantity === 1
                        ? "item"
                        : "items"}
                    </p>
                  </div>
                </div>

                {order.items.length > 0 ? (
                  <div className={styles.orderItems}>
                    {order.items.map((item, index) => {
                      const productId =
                        getProductId(item.product);

                      const quantity =
                        getItemQuantity(item.quantity);

                      const itemTotal =
                        Number.isFinite(item.price) &&
                        item.price >= 0
                          ? item.price * quantity
                          : 0;

                      return (
                        <article
                          className={styles.orderItem}
                          key={`${productId}-${index}`}
                        >
                          {item.thumbnail ? (
                            <img
                              className={styles.itemImage}
                              src={item.thumbnail}
                              alt=""
                              loading="lazy"
                              onError={(event) => {
                                event.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <div
                              className={
                                styles.itemImagePlaceholder
                              }
                              aria-hidden="true"
                            >
                              No image
                            </div>
                          )}

                          <div className={styles.itemInfo}>
                            <h3>
                              {item.title ||
                                "Product unavailable"}
                            </h3>

                            <p>
                              Quantity: {quantity}
                            </p>

                            <p>
                              Unit price:{" "}
                              {formatCurrency(item.price)}
                            </p>
                          </div>

                          <strong
                            className={styles.itemTotal}
                          >
                            {formatCurrency(itemTotal)}
                          </strong>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.empty}>
                    No products found for this order.
                  </p>
                )}

                <div className={styles.orderTotal}>
                  <span>Total</span>

                  <strong>
                    {formatCurrency(order.totalAmount)}
                  </strong>
                </div>
              </section>

              <div>
                <Link
                  href="/admin/orders"
                  className={styles.link}
                >
                  ← Back to all orders
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </AdminRoute>
  );
}

