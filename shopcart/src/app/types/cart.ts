
export interface CartProduct {
  _id: string;
  title: string;
  price: number;
  thumbnail: string;
  stock: number;
  discountPercentage: number;
}

export interface CartItem {
  product: CartProduct;
  quantity: number;
}

export interface Cart {
  _id: string;
  user: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AddToCartData {
  productId: string;
  quantity: number;
}

export interface UpdateCartData {
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  cart: Cart;
  message?: string;
}


