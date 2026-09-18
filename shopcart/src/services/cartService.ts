import { apiRequest } from "@/lib/api";

export interface CartItem {
  product: {
    _id: string;
    title: string;
    price: number;
    thumbnail: string;
    stock: number;
    discountPercentage: number;
  };
  quantity: number;
  price: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartResponse {
  success: boolean;
  cart: Cart;
  message?: string;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
}

export interface UpdateCartData {
  quantity: number;
}

export const getCart = async (token: string): Promise<CartResponse> => {
  return apiRequest<CartResponse>("/cart", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const addToCart = async (
  token: string,
  cartData: AddToCartData
): Promise<CartResponse> => {
  return apiRequest<CartResponse>("/cart", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cartData),
  });
};

export const updateCartItem = async (
  token: string,
  productId: string,
  cartData: UpdateCartData
): Promise<CartResponse> => {
  return apiRequest<CartResponse>(`/cart/${productId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(cartData),
  });
};

export const removeCartItem = async (
  token: string,
  productId: string
): Promise<CartResponse> => {
  return apiRequest<CartResponse>(`/cart/${productId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const clearCart = async (
  token: string
): Promise<CartResponse> => {
  return apiRequest<CartResponse>("/cart", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};