
import { apiRequest } from "@/lib/api";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
}

export interface OrderItem {
  product: string;
  title: string;
  quantity: number;
  price: number;
  thumbnail?: string;
}

export type PaymentMethod = "COD" | "ONLINE";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderUser {
  _id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
}

export interface Order {
  _id: string;
  user: string | OrderUser;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderData {
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  order: Order;
}
export interface OrdersPagination {
  currentPage: number;
  limit: number;
  totalOrders: number;
  totalPages: number;
}

export interface OrdersResponse {
  success: boolean;
  count?: number;
  orders: Order[];
  pagination: OrdersPagination;
}

export const createOrder = async (
  token: string,
  orderData: CreateOrderData
): Promise<OrderResponse> => {
  return apiRequest<OrderResponse>("/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  });
};

export const getOrders = async (
  token: string,
  page = 1,
  limit = 10
): Promise<OrdersResponse> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  return apiRequest<OrdersResponse>(
    `/orders?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

export const getOrderById = async (
  token: string,
  orderId: string
): Promise<OrderResponse> => {
  return apiRequest<OrderResponse>(`/orders/${orderId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};



export const cancelOrder = async (
  token: string,
  orderId: string
): Promise<OrderResponse> => {
  return apiRequest<OrderResponse>(`/orders/${orderId}/cancel`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};



