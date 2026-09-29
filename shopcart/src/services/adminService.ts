import { apiRequest } from "@/lib/api";

import type {
  Order,
  OrderResponse,
} from "./orderService";

type Dashboard = {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue?: number;
  revenue?: number;
  activeProducts: number;
};

export interface DashboardResponse {
  success: boolean;
  stats: Dashboard;
  dashboard: Dashboard;
}

export interface UsersResponse {
  success: boolean;
  users: Array<{
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    createdAt?: string;
  }>;
}

export interface AdminOrdersResponse {
  success: boolean;
  orders: Order[];
}

export interface UpdateOrderStatusData {
  status:
    | "placed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
}

export const getDashboard = async (
  token: string
): Promise<DashboardResponse> => {
  return apiRequest<DashboardResponse>("/admin/dashboard", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAllUsers = async (
  token: string
): Promise<UsersResponse> => {
  return apiRequest<UsersResponse>("/admin/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAllOrders = async (
  token: string
): Promise<AdminOrdersResponse> => {
  return apiRequest<AdminOrdersResponse>("/admin/orders", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateOrderStatus = async (
  token: string,
  orderId: string,
  statusData: UpdateOrderStatusData
): Promise<OrderResponse> => {
  return apiRequest<OrderResponse>(
    `/admin/orders/${orderId}/status`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(statusData),
    }
  );
};
