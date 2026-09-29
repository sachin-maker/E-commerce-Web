import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/app/types/product";
import { isValidProduct } from "@/app/utils/productValidation";

export interface WishlistState {
  items: Product[];
}

const initialState: WishlistState = {
  items: [],
};



const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,

  reducers: {
    addToWishlist: (state, action: PayloadAction<Product>) => {
      const product = action.payload;

      if (!isValidProduct(product)) {
        return;
      }

      const alreadyExists = state.items.some(
        (item) => item._id === product._id
      );

      if (!alreadyExists) {
        state.items.push(product);
      }
    },

    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item._id !== action.payload
      );
    },

    clearWishlist: (state) => {
      state.items = [];
    },

    setWishlistItems: (
      state,
      action: PayloadAction<Product[]>
    ) => {
      state.items = action.payload.filter(isValidProduct);
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  setWishlistItems,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
