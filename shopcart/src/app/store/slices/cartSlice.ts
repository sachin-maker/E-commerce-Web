
import {
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";

import {
  type CartProduct,
  type CartItem,
} from "@/app/types/cart";





interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const clampQuantity = (
  quantity: number,
  stock: number
): number => {
  if (stock < 1) {
    return 0;
  }

  return Math.min(
    Math.max(quantity, 1),
    stock
  );
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    addToCart: (
      state,
      action: PayloadAction<{
        product: CartProduct;
        quantity?: number;
      }>
    ) => {
      const {
        product,
        quantity = 1,
      } = action.payload;

      if (product.stock < 1) {
        return;
      }

      const existingItem = state.items.find(
        (item) =>
          item.product._id === product._id
      );

      if (existingItem) {
        const nextQuantity = clampQuantity(
          existingItem.quantity + quantity,
          product.stock
        );

        if (nextQuantity > 0) {
          existingItem.quantity = nextQuantity;
        }

        return;
      }

      const nextQuantity = clampQuantity(
        quantity,
        product.stock
      );

      if (nextQuantity > 0) {
        state.items.push({
          product,
          quantity: nextQuantity,
        });
      }
    },

    increaseQuantity: (
      state,
      action: PayloadAction<string>
    ) => {
      const item = state.items.find(
        (cartItem) =>
          cartItem.product._id === action.payload
      );

      if (!item) {
        return;
      }

      if (
        item.product.stock < 1 ||
        item.quantity >= item.product.stock
      ) {
        return;
      }

      item.quantity += 1;
    },

    decreaseQuantity: (
      state,
      action: PayloadAction<string>
    ) => {
      const item = state.items.find(
        (cartItem) =>
          cartItem.product._id === action.payload
      );

      if (!item) {
        return;
      }

      if (item.quantity > 1) {
        item.quantity -= 1;
        return;
      }

      state.items = state.items.filter(
        (cartItem) =>
          cartItem.product._id !== action.payload
      );
    },

    removeFromCart: (
      state,
      action: PayloadAction<string>
    ) => {
      state.items = state.items.filter(
        (item) =>
          item.product._id !== action.payload
      );
    },

    clearCart: (state) => {
      state.items = [];
    },

    setCartItems: (
      state,
      action: PayloadAction<CartItem[]>
    ) => {
      state.items = action.payload.filter(
        (item) =>
          item.product &&
          item.product._id &&
          item.quantity >= 1
      );
    },
  },
});

export const {
  addToCart,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
  setCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;


