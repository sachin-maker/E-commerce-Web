"use client";

import Image from "next/image";
import { useAppSelector } from "@/app/store/hooks";
import ProtectedRoute from "@/app/components/auth/ProtectedRoute";
import "./Orders.css";


export default function OrdersPage() {
  const orders = useAppSelector((state) => state.orders.orders);

  if (orders.length === 0) {
    return (
      <main className="orders-page">
        <h1 className="orders-title">My Orders</h1>

        <div className="empty-orders">
          <h2>No orders yet</h2>
          <p>
            You haven&apos;t placed any orders yet.
          </p>
        </div>
      </main>
    );
  }

  return (
    <ProtectedRoute>

    
    <main className="orders-page">
      <h1 className="orders-title">My Orders</h1>

      {orders.map((order) => (
        <section className="order-card" key={order.id}>
          <div className="order-header">
            <div>
              <div className="order-id">
                Order #{order.id}
              </div>

              <div className="order-date">
                {new Date(order.date).toLocaleDateString()}
              </div>
            </div>

            <div className="payment-method">
              Payment: {order.customer.payment}
            </div>
          </div>

          <div className="order-body">
            {order.items.map((item) => (
              <div
                className="order-product"
                key={item.product._id}
              >
                <Image
                  src={item.product.thumbnail}
                  alt={item.product.title}
                  width={90}
                  height={90}
                  className="order-product-image"
                />

                <div className="order-product-info">
                  <div className="order-product-title">
                    {item.product.title}
                  </div>

                  <div className="order-product-details">
                    Quantity: {item.quantity}
                  </div>

                  <div className="order-product-details">
                    Price: ${item.product.price.toFixed(2)}
                  </div>

                  <div className="order-product-details">
                    Item total: $
                    {(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}

            <div className="shipping-info">
              <h3>Shipping Address</h3>

              <p>{order.customer.fullName}</p>

              <p>{order.customer.address}</p>

              <p>
                {order.customer.city} -{" "}
                {order.customer.postalCode}
              </p>

              <p>Phone: {order.customer.phone}</p>
            </div>
          </div>

          <div className="order-footer">
            <span className="payment-method">
              {order.items.length}{" "}
              {order.items.length === 1 ? "item" : "items"}
            </span>

            <span className="order-total">
              Total: ${order.total.toFixed(2)}
            </span>
          </div>
        </section>
      ))}
    </main>
    </ProtectedRoute>
  );
}