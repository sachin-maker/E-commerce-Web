import { apiRequest } from "@/lib/api";
import type { Order, OrderResponse } from "./orderService";
import type { Product, ProductResponse } from "./productService";

export interface Dashboard {
  totalUsers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface DashboardResponse {
  success: boolean;
  stats: Dashboard;
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

export interface CreateProductData {
  title: string;
  description: string;
  price: number;
  discountPercentage?: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images?: string[];
}

export type UpdateProductData = Partial<CreateProductData>;

export interface AdminProductResponse {
  success: boolean;
  message?: string;
  product: Product;
}

export interface AdminOrdersResponse {
  success: boolean;
  orders: Order[];
}

export interface UpdateOrderStatusData {
  orderStatus:
    | "PLACED"
    | "CONFIRMED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
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
      },
      body: JSON.stringify(statusData),
    }
  );
};

export const createProduct = async (
  token: string,
  productData: CreateProductData
): Promise<AdminProductResponse> => {
  return apiRequest<AdminProductResponse>("/admin/products", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
};

export const updateProduct = async (
  token: string,
  productId: string,
  productData: UpdateProductData
): Promise<AdminProductResponse> => {
  return apiRequest<AdminProductResponse>(`/admin/products/${productId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });
};

export const deleteProduct = async (
  token: string,
  productId: string
): Promise<{ success: boolean; message: string }> => {
  return apiRequest<{ success: boolean; message: string }>(
    `/admin/products/${productId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

