import { apiRequest } from "@/lib/api";

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface OrderItem {
  product: string;
  title: string;
  quantity: number;
  price: number;
  thumbnail?: string;
}

export interface Order {
  _id: string;
  user: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "pending" | "paid" | "failed";
  status:
    | "placed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateOrderData {
  shippingAddress: ShippingAddress;
  paymentMethod: "COD" | "ONLINE";
}

export interface OrderResponse {
  success: boolean;
  message?: string;
  order: Order;
}

export interface OrdersResponse {
  success: boolean;
  orders: Order[];
}

export const createOrder = async (
  token: string,
  orderData: CreateOrderData
): Promise<OrderResponse> => {
  return apiRequest<OrderResponse>("/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });
};

export const getOrders = async (
  token: string
): Promise<OrdersResponse> => {
  return apiRequest<OrdersResponse>("/orders", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
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