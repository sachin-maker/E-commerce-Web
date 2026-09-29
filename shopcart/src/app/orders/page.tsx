
"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import { useAppSelector } from "@/app/store/hooks";

import "./Orders.css";

import {
  getOrders,
  type Order,
} from "@/services/orderService";

const formatCurrency = (amount: number): string => {
  if (!Number.isFinite(amount)) {
    return "₹0.00";
  }

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatOrderDate = (
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

const formatPaymentMethod = (
  paymentMethod: Order["paymentMethod"]
): string => {
  switch (paymentMethod) {
    case "COD":
      return "Cash on Delivery";

    case "ONLINE":
      return "Online Payment";

    default:
      return paymentMethod;
  }
};

const formatOrderStatus = (
  status: Order["orderStatus"]
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

const getStatusClassName = (
  status: Order["orderStatus"]
): string => {
  return `order-status order-status-${status.toLowerCase()}`;
};

const formatPaymentStatus = (
  status: Order["paymentStatus"]
): string => {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "PAID":
      return "Paid";

    case "FAILED":
      return "Failed";

    default:
      return status;
  }
};

const getOrderDisplayId = (
  orderId: string
): string => {
  if (!orderId) {
    return "Unavailable";
  }

  /*
   * Keep the real MongoDB ID for routing/API calls,
   * but show a shorter customer-friendly identifier.
   */
  return orderId.length > 12
    ? orderId.slice(-8).toUpperCase()
    : orderId.toUpperCase();
};

export default function OrdersPage() {
  const token = useAppSelector(
    (state) => state.auth.token
  );

  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  const isInitialized = useAppSelector(
    (state) => state.auth.isInitialized
  );

  const [orders, setOrders] = useState<Order[]>(
    []
  );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");
  const ORDERS_PER_PAGE = 10;

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalOrders, setTotalOrders] =
    useState(0);

  const loadOrders = useCallback(async () => {
    if (!isInitialized) {
      return;
    }

  if (!isAuthenticated || !token) {
  setOrders([]);
  setTotalPages(1);
  setTotalOrders(0);
  setIsLoading(false);
  return;
}

    try {
      setIsLoading(true);
      setError("");

      const response = await getOrders(
        token,
        currentPage,
        ORDERS_PER_PAGE
      );
      setOrders(
        Array.isArray(response.orders)
          ? response.orders
          : []
      );

      setTotalPages(
        response.pagination?.totalPages ?? 1
      );

      setTotalOrders(
        response.pagination?.totalOrders ?? 0
      );
    } catch (err) {
      console.error(
        "Failed to load orders:",
        err
      );

      let message =
        "Unable to load your orders.";

      if (err instanceof Error) {
        try {
          const parsedError = JSON.parse(
            err.message
          );

          if (
            parsedError &&
            typeof parsedError.message ===
            "string"
          ) {
            message = parsedError.message;
          } else if (err.message) {
            message = err.message;
          }
        } catch {
          if (err.message) {
            message = err.message;
          }
        }
      }

      setError(message);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    currentPage,
    isAuthenticated,
    isInitialized,
    token,
  ]);

 useEffect(() => {
  if (!isAuthenticated) {
    setCurrentPage(1);
  }
}, [isAuthenticated]);

useEffect(() => {
  loadOrders();
}, [loadOrders]);

  return (
    <ProtectedRoute>
      <main className="orders-page">
        <div className="orders-container">
          <header className="orders-header">
            <div>
              <h1 className="orders-title">
                My Orders
              </h1>

              {!isLoading &&
                !error &&
                orders.length > 0 && (
                  <p className="orders-count">
                    {totalOrders}{" "}
                    {totalOrders === 1
                      ? "order"
                      : "orders"}
                  </p>
                )}
            </div>
          </header>

          {isLoading && (
            <section
              className="orders-state"
              aria-live="polite"
              aria-busy="true"
            >
              <div
                className="orders-loader"
                aria-hidden="true"
              />

              <p>
                Loading your orders...
              </p>
            </section>
          )}

          {!isLoading && error && (
            <section
              className="orders-state orders-error"
              role="alert"
              aria-labelledby="orders-error-title"
            >
              <h2 id="orders-error-title">
                Unable to load orders
              </h2>

              <p>{error}</p>

              <button
                type="button"
                className="retry-orders-btn"
                onClick={loadOrders}
                disabled={isLoading}
              >
                Try Again
              </button>
            </section>
          )}

          {!isLoading &&
            !error &&
            orders.length === 0 && (
              <section
                className="empty-orders"
                aria-labelledby="empty-orders-title"
              >
                <div
                  className="empty-orders-icon"
                  aria-hidden="true"
                >
                  📦
                </div>

                <h2 id="empty-orders-title">
                  No orders yet
                </h2>

                <p>
                  You haven&apos;t placed any
                  orders yet.
                </p>

                <Link
                  href="/products"
                  className="continue-shopping-btn"
                >
                  Start Shopping
                </Link>
              </section>
            )}

          {!isLoading &&
            !error &&
            orders.length > 0 && (
              <div className="orders-list">
                {orders.map((order) => {
                  const orderItemCount =
                    order.items?.reduce(
                      (total, item) =>
                        total +
                        (Number.isFinite(
                          item.quantity
                        )
                          ? item.quantity
                          : 0),
                      0
                    ) ?? 0;

                  return (
                    <article
                      className="order-card"
                      key={order._id}
                      aria-labelledby={`order-${order._id}`}
                    >
                      <header className="order-header">
                        <div className="order-header-info">
                          <h2
                            className="order-id"
                            id={`order-${order._id}`}
                          >
                            Order #
                            {getOrderDisplayId(
                              order._id
                            )}
                          </h2>

                          <time
                            className="order-date"
                            dateTime={
                              order.createdAt
                            }
                          >
                            {formatOrderDate(
                              order.createdAt
                            )}
                          </time>
                        </div>

                        <div className="order-status-wrapper">
                          <span
                            className={getStatusClassName(
                              order.orderStatus
                            )}
                          >
                            {formatOrderStatus(
                              order.orderStatus
                            )}
                          </span>
                        </div>
                      </header>

                      <div className="order-body">
                        <section
                          className="order-items"
                          aria-labelledby={`items-${order._id}`}
                        >
                          <h3
                            className="order-section-title"
                            id={`items-${order._id}`}
                          >
                            Items
                          </h3>

                          {order.items?.map(
                            (item, index) => {
                              const itemTotal =
                                item.price *
                                item.quantity;

                              return (
                                <article
                                  className="order-product"
                                  key={`${item.product}-${index}`}
                                >
                                  {item.thumbnail ? (
                                    <Image
                                      src={
                                        item.thumbnail
                                      }
                                      alt={
                                        item.title
                                      }
                                      width={90}
                                      height={90}
                                      className="order-product-image"
                                      sizes="90px"
                                    />
                                  ) : (
                                    <div
                                      className="order-product-image-placeholder"
                                      aria-hidden="true"
                                    >
                                      No image
                                    </div>
                                  )}

                                  <div className="order-product-info">
                                    <h4 className="order-product-title">
                                      {item.title}
                                    </h4>

                                    <p className="order-product-details">
                                      Quantity:{" "}
                                      {
                                        item.quantity
                                      }
                                    </p>

                                    <p className="order-product-details">
                                      Price:{" "}
                                      {formatCurrency(
                                        item.price
                                      )}
                                    </p>

                                    <p className="order-product-details">
                                      Item total:{" "}
                                      {formatCurrency(
                                        itemTotal
                                      )}
                                    </p>
                                  </div>
                                </article>
                              );
                            }
                          )}
                        </section>

                        <section
                          className="shipping-info"
                          aria-labelledby={`shipping-${order._id}`}
                        >
                          <h3
                            className="order-section-title"
                            id={`shipping-${order._id}`}
                          >
                            Shipping Address
                          </h3>

                          <address>
                            <p>
                              {
                                order
                                  .shippingAddress
                                  .fullName
                              }
                            </p>

                            <p>
                              {
                                order
                                  .shippingAddress
                                  .addressLine
                              }
                            </p>

                            <p>
                              {
                                order
                                  .shippingAddress
                                  .city
                              }
                              ,{" "}
                              {
                                order
                                  .shippingAddress
                                  .state
                              }{" "}
                              -{" "}
                              {
                                order
                                  .shippingAddress
                                  .postalCode
                              }
                            </p>

                            <p>
                              Phone:{" "}
                              {
                                order
                                  .shippingAddress
                                  .phone
                              }
                            </p>
                          </address>

                          <div className="payment-details">
                            <p>
                              <strong>
                                Payment:
                              </strong>{" "}
                              {formatPaymentMethod(
                                order.paymentMethod
                              )}
                            </p>

                            <p>
                              <strong>
                                Payment Status:
                              </strong>{" "}
                              {formatPaymentStatus(
                                order.paymentStatus
                              )}
                            </p>
                          </div>
                        </section>
                      </div>

                      <footer className="order-footer">
                        <div className="order-footer-info">
                          <span className="payment-method">
                            {orderItemCount}{" "}
                            {orderItemCount === 1
                              ? "item"
                              : "items"}
                          </span>

                          <strong className="order-total">
                            Total:{" "}
                            {formatCurrency(
                              order.totalAmount
                            )}
                          </strong>
                        </div>

                        <Link
                          href={`/orders/${order._id}`}
                          className="view-order-btn"
                        >
                          View Details
                        </Link>
                      </footer>
                    </article>
                  );
                })}
              </div>



            )}
          {!isLoading &&
            !error &&
            totalPages > 1 && (
              <nav
                className="orders-pagination"
                aria-label="Orders pagination"
              >
                <button
                  type="button"
                  className="orders-pagination-button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(page - 1, 1)
                    )
                  }
                  disabled={currentPage === 1 || isLoading}
                  aria-label="Go to previous page"
                >
                  Previous
                </button>

                <span
                  className="orders-pagination-status"
                  aria-current="page"
                >
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  type="button"
                  className="orders-pagination-button"
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(
                        page + 1,
                        totalPages
                      )
                    )
                  }
                  disabled={
                    currentPage === totalPages ||
                    isLoading
                  }
                  aria-label="Go to next page"
                >
                  Next
                </button>
              </nav>
            )}


        </div>
      </main>
    </ProtectedRoute>
  );
}


