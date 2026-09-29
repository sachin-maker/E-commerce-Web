
"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useState,
} from "react";

import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import { useAppSelector } from "@/app/store/hooks";

import "./OrderDetails.css";

import {
  cancelOrder,
  getOrderById,
  type Order,
} from "@/services/orderService";

const formatCurrency = (
  amount: number
): string => {
  if (!Number.isFinite(amount)) {
    return "₹0.00";
  }

  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
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
      month: "long",
      year: "numeric",
    }
  );
};

const formatDateTime = (
  date?: string
): string => {
  if (!date) {
    return "Date unavailable";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

const formatPaymentStatus = (
  paymentStatus: Order["paymentStatus"]
): string => {
  switch (paymentStatus) {
    case "PENDING":
      return "Pending";

    case "PAID":
      return "Paid";

    case "FAILED":
      return "Failed";

    default:
      return paymentStatus;
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

const getStatusClass = (
  status: Order["orderStatus"]
): string => {
  return `status-badge status-${status.toLowerCase()}`;
};

const getStatusStep = (
  status: Order["orderStatus"]
): number => {
  switch (status) {
    case "PLACED":
      return 1;

    case "CONFIRMED":
      return 2;

    case "SHIPPED":
      return 3;

    case "DELIVERED":
      return 4;

    case "CANCELLED":
      return 0;

    default:
      return 1;
  }
};

const getOrderDisplayId = (
  orderId: string
): string => {
  if (!orderId) {
    return "Unavailable";
  }

  return orderId.length > 12
    ? orderId.slice(-8).toUpperCase()
    : orderId.toUpperCase();
};

const parseApiError = (
  error: unknown,
  fallback: string
): string => {
  if (!(error instanceof Error)) {
    return fallback;
  }

  if (!error.message) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(error.message);

    if (
      parsed &&
      typeof parsed.message === "string"
    ) {
      return parsed.message;
    }
  } catch {
    // The error is already a normal message.
  }

  return error.message;
};

export default function OrderDetailsPage() {
  const params = useParams<{
    id: string;
  }>();

  const token = useAppSelector(
    (state) => state.auth.token
  );

  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  const isInitialized = useAppSelector(
    (state) => state.auth.isInitialized
  );

  const orderId = params?.id;

  const [order, setOrder] =
    useState<Order | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] = useState("");

  const [isCancelling, setIsCancelling] =
    useState(false);

  const [cancelError, setCancelError] =
    useState("");

  const [cancelSuccess, setCancelSuccess] =
    useState("");

  const loadOrder = useCallback(async () => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated || !token || !orderId) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      const response = await getOrderById(
        token,
        orderId
      );

      setOrder(response.order);
    } catch (err) {
      console.error(
        "Failed to load order:",
        err
      );

      setOrder(null);

      setError(
        parseApiError(
          err,
          "Unable to load this order."
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    isAuthenticated,
    isInitialized,
    orderId,
    token,
  ]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleCancelOrder = async () => {
    if (
      isCancelling ||
      !token ||
      !orderId ||
      !order
    ) {
      return;
    }

    if (
      order.orderStatus !== "PLACED" &&
      order.orderStatus !== "CONFIRMED"
    ) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setIsCancelling(true);
      setCancelError("");
      setCancelSuccess("");

      const response = await cancelOrder(
        token,
        orderId
      );

      setOrder(response.order);

      setCancelSuccess(
        "Order cancelled successfully. The product stock has been restored."
      );
    } catch (err) {
      console.error(
        "Failed to cancel order:",
        err
      );

      setCancelError(
        parseApiError(
          err,
          "Unable to cancel this order."
        )
      );
    } finally {
      setIsCancelling(false);
    }
  };

  const currentStep = order
    ? getStatusStep(order.orderStatus)
    : 1;

  const totalItemQuantity =
    order?.items.reduce(
      (total, item) =>
        total +
        (Number.isFinite(item.quantity)
          ? item.quantity
          : 0),
      0
    ) ?? 0;

  return (
    <ProtectedRoute>
      <main className="order-details-page">
        <div className="order-details-container">
          <Link
            href="/orders"
            className="back-to-orders"
          >
            ← Back to My Orders
          </Link>

          {isLoading && (
            <section
              className="order-details-state"
              aria-live="polite"
              aria-busy="true"
            >
              <div
                className="order-details-loader"
                aria-hidden="true"
              />

              <p>
                Loading order details...
              </p>
            </section>
          )}

          {!isLoading && error && (
            <section
              className="order-details-state order-details-error"
              role="alert"
              aria-labelledby="order-error-title"
            >
              <h1 id="order-error-title">
                Unable to load order
              </h1>

              <p>{error}</p>

              <div className="order-details-error-actions">
                <button
                  type="button"
                  className="secondary-action"
                  onClick={loadOrder}
                  disabled={isLoading}
                >
                  Try Again
                </button>

                <Link
                  href="/orders"
                  className="back-orders-btn"
                >
                  Back to My Orders
                </Link>
              </div>
            </section>
          )}

          {!isLoading &&
            !error &&
            !order && (
              <section
                className="order-details-state"
                role="status"
              >
                <h1>Order not found</h1>

                <p>
                  The requested order could
                  not be found.
                </p>

                <Link
                  href="/orders"
                  className="back-orders-btn"
                >
                  Back to My Orders
                </Link>
              </section>
            )}

          {!isLoading &&
            !error &&
            order && (
              <>
                <header className="order-details-header">
                  <div>
                    <p className="order-details-eyebrow">
                      Order Details
                    </p>

                    <h1>
                      Order #
                      {getOrderDisplayId(
                        order._id
                      )}
                    </h1>

                    <p className="order-created-date">
                      Placed on{" "}
                      {formatDate(
                        order.createdAt
                      )}
                    </p>
                  </div>

                  <span
                    className={getStatusClass(
                      order.orderStatus
                    )}
                  >
                    {formatOrderStatus(
                      order.orderStatus
                    )}
                  </span>
                </header>

                {order.orderStatus !==
                  "CANCELLED" && (
                    <section
                      className="order-progress"
                      aria-labelledby="order-progress-title"
                    >
                      <h2 id="order-progress-title">
                        Order Status
                      </h2>

                      <p className="order-progress-description">
                        Your order is currently{" "}
                        <strong>
                          {formatOrderStatus(order.orderStatus)}
                        </strong>
                        .
                      </p>

                      <div className="progress-track">
                        <div
                          className="progress-line"
                          aria-hidden="true"
                        >
                          <div
                            className="progress-line-active"
                            style={{
                              width: `${Math.max(
                                0,
                                Math.min(
                                  100,
                                  ((currentStep -
                                    1) /
                                    3) *
                                  100
                                )
                              )}%`,
                            }}
                          />
                        </div>

                        {[
                          {
                            step: 1,
                            label: "Placed",
                          },
                          {
                            step: 2,
                            label: "Confirmed",
                          },
                          {
                            step: 3,
                            label: "Shipped",
                          },
                          {
                            step: 4,
                            label: "Delivered",
                          },
                        ].map((item) => {
                          const isActive = currentStep >= item.step;
                          const isCurrent = currentStep === item.step;

                          return (
                            <div
                              className={`progress-step ${isActive
                                ? "progress-step-active"
                                : ""
                                }`}
                              key={item.step}
                              aria-current={
                                isCurrent ? "step" : undefined
                              }
                            >
                              <div
                                className="progress-circle"
                                aria-hidden="true"
                              >
                                {isActive ? "✓" : item.step}
                              </div>

                              <span>{item.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  )}

                {order.orderStatus ===
                  "CANCELLED" && (
                    <section
                      className="cancelled-banner"
                      role="status"
                    >
                      <strong>
                        Order Cancelled
                      </strong>

                      <p>
                        This order was cancelled and will not
                        be shipped.
                      </p>
                    </section>
                  )}

                {cancelSuccess && (
                  <div
                    className="order-action-success"
                    role="status"
                    aria-live="polite"
                  >
                    {cancelSuccess}
                  </div>
                )}

                {cancelError && (
                  <div
                    className="order-action-error"
                    role="alert"
                  >
                    {cancelError}
                  </div>
                )}

                <div className="order-details-grid">
                  <section
                    className="order-details-card"
                    aria-labelledby="ordered-items-title"
                  >
                    <h2 id="ordered-items-title">
                      Ordered Items
                    </h2>

                    <div className="details-items">
                      {order.items.map(
                        (item, index) => (
                          <article
                            className="details-item"
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
                                width={100}
                                height={100}
                                className="details-item-image"
                                sizes="100px"
                              />
                            ) : (
                              <div
                                className="details-item-placeholder"
                                aria-hidden="true"
                              >
                                No image
                              </div>
                            )}

                            <div className="details-item-info">
                              <h3>
                                {item.title}
                              </h3>

                              <p>
                                Quantity:{" "}
                                {
                                  item.quantity
                                }
                              </p>

                              <p>
                                Unit price:{" "}
                                {formatCurrency(
                                  item.price
                                )}
                              </p>
                            </div>

                            <strong className="details-item-total">
                              {formatCurrency(
                                item.price *
                                item.quantity
                              )}
                            </strong>
                          </article>
                        )
                      )}
                    </div>
                  </section>

                  <aside className="order-details-sidebar">
                    <section
                      className="order-details-card"
                      aria-labelledby="shipping-title"
                    >
                      <h2 id="shipping-title">
                        Shipping Address
                      </h2>

                      <address className="shipping-address">
                        <strong>
                          {
                            order
                              .shippingAddress
                              .fullName
                          }
                        </strong>

                        <span>
                          {
                            order
                              .shippingAddress
                              .addressLine
                          }
                        </span>

                        <span>
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
                          }
                        </span>

                        <span>
                          {
                            order
                              .shippingAddress
                              .postalCode
                          }
                        </span>

                        <span>
                          Phone:{" "}
                          {
                            order
                              .shippingAddress
                              .phone
                          }
                        </span>
                      </address>
                    </section>

                    <section
                      className="order-details-card"
                      aria-labelledby="payment-title"
                    >
                      <h2 id="payment-title">
                        Payment Information
                      </h2>

                      <div className="payment-info">
                        <div>
                          <span>
                            Payment Method
                          </span>

                          <strong>
                            {formatPaymentMethod(
                              order.paymentMethod
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Payment Status
                          </span>

                          <strong>
                            {formatPaymentStatus(
                              order.paymentStatus
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            Order Date
                          </span>

                          <strong>
                            {formatDateTime(
                              order.createdAt
                            )}
                          </strong>
                        </div>
                      </div>
                    </section>

                    <section
                      className="order-details-card"
                      aria-labelledby="summary-title"
                    >
                      <h2 id="summary-title">
                        Order Summary
                      </h2>

                      <div className="summary-row">
                        <span>Items</span>

                        <span>
                          {totalItemQuantity}
                        </span>
                      </div>

                      <div className="summary-divider" />

                      <div className="summary-total">
                        <span>Total</span>

                        <strong>
                          {formatCurrency(
                            order.totalAmount
                          )}
                        </strong>
                      </div>
                    </section>
                  </aside>
                </div>

                <div className="order-details-actions">
                  <Link
                    href="/orders"
                    className="secondary-action"
                  >
                    Back to Orders
                  </Link>

                  {(order.orderStatus ===
                    "PLACED" ||
                    order.orderStatus ===
                    "CONFIRMED") && (
                      <button
                        type="button"
                        className="cancel-order-action"
                        onClick={
                          handleCancelOrder
                        }
                        disabled={isCancelling}
                        aria-busy={
                          isCancelling
                        }
                      >
                        {isCancelling
                          ? "Cancelling..."
                          : "Cancel Order"}
                      </button>
                    )}

                  <Link
                    href="/products"
                    className="primary-action"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </>
            )}
        </div>
      </main>
    </ProtectedRoute>
  );
}

