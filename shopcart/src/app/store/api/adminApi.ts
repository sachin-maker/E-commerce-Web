import { baseApi } from "./baseApi";
import type { Product } from "@/app/types/product";

export type AdminUser = {
  _id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
};

export type AdminOrder = {
  _id: string;
  user: AdminUser | null;
  totalAmount: number;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  orderStatus: "PLACED" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  createdAt: string;
};

export type AdminOrderItem = {
  product: string | {
    _id: string;
    title?: string;
    thumbnail?: string;
  };
  title: string;
  quantity: number;
  price: number;
  thumbnail?: string;
};

export type AdminShippingAddress = {
  fullName: string;
  phone: string;
  address?: string;
  addressLine?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type AdminOrderDetails = {
  _id: string;
  user: AdminUser | null;
  items: AdminOrderItem[];
  shippingAddress: AdminShippingAddress;
  totalAmount: number;
  paymentMethod: "COD" | "ONLINE";
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  orderStatus:
  | "PLACED"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";
  createdAt: string;
  updatedAt?: string;
};


export type Pagination = { page: number; limit: number; total: number; pages: number };
export type Dashboard = {
  totalUsers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  totalRevenue: number;
  recentOrders: AdminOrder[];
  recentUsers: AdminUser[];
};

type PageParams = { page?: number; limit?: number; search?: string; status?: string };
const queryString = (params: PageParams) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") search.set(key, String(value));
  });
  return search.toString();
};

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboard: builder.query<{ success: boolean; dashboard: Dashboard }, void>({
      query: () => "/admin/dashboard",
      providesTags: ["Dashboard"],
    }),
    getAdminUsers: builder.query<{ users: AdminUser[]; pagination: Pagination }, PageParams>({
      query: (params) => `/admin/users?${queryString(params)}`,
      providesTags: ["Users"],
    }),
    getAdminOrders: builder.query<{ orders: AdminOrder[]; pagination: Pagination }, PageParams>({
      query: (params) => `/admin/orders?${queryString(params)}`,
      providesTags: ["Orders"],
    }),
    getAdminProducts: builder.query<{ products: Product[]; pagination: Pagination }, PageParams>({
      query: (params) => `/admin/products?${queryString(params)}`,
      providesTags: ["Products"],
    }),
    updateOrderStatus: builder.mutation<AdminOrder, { id: string; orderStatus: AdminOrder["orderStatus"] }>({
      query: ({ id, orderStatus }) => ({ url: `/admin/orders/${id}/status`, method: "PATCH", body: { orderStatus } }),
      transformResponse: (response: { order: AdminOrder }) => response.order,
      invalidatesTags: ["Orders", "Dashboard"],
    }),
    createProduct: builder.mutation<Product, Partial<Product>>({
      query: (body) => ({ url: "/admin/products", method: "POST", body }),
      transformResponse: (response: { product: Product }) => response.product,
invalidatesTags: (_result, _error, { _id }) => [
  "Products",
  { type: "Product", _id },
  "Search",
  "Dashboard",
],    }),
    updateProduct: builder.mutation<Product, { id: string; changes: Partial<Product> }>({
      query: ({ id, changes }) => ({ url: `/admin/products/${id}`, method: "PATCH", body: changes }),
      transformResponse: (response: { product: Product }) => response.product,
      invalidatesTags: (_result, _error, { id }) => [
  "Products",
  { type: "Product", id },
  "Search",
  "Dashboard",
],
    }),
    deactivateProduct: builder.mutation<Product, string>({
      query: (id) => ({ url: `/admin/products/${id}`, method: "DELETE" }),
      transformResponse: (response: { product: Product }) => response.product,
      invalidatesTags: (_result, _error, id) => [
  "Products",
  { type: "Product", id },
  "Search",
  "Dashboard",
],
    }),
    getAdminOrderById: builder.query<
      { success: boolean; order: AdminOrderDetails },
      string
    >({
      query: (id) => `/admin/orders/${id}`,
      providesTags: ["Orders"],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetAdminUsersQuery,
  useGetAdminOrdersQuery,
  useGetAdminOrderByIdQuery,
  useGetAdminProductsQuery,
  useUpdateOrderStatusMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeactivateProductMutation,
} = adminApi;
