import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Product } from "@/app/types/product";

interface RecentlyViewedState {
  products: Product[];
}

const initialState: RecentlyViewedState = {
  products: [],
};

const MAX_RECENT_PRODUCTS = 8;

const recentlyViewedSlice = createSlice({
  name: "recentlyViewed",
  initialState,
  reducers: {
    addRecentlyViewed: (
      state,
      action: PayloadAction<Product>
    ) => {
      const product = action.payload;

      state.products = state.products.filter(
        (item) => item._id !== product._id
      );

      state.products.unshift(product);

      if (state.products.length > MAX_RECENT_PRODUCTS) {
        state.products.pop();
      }
    },

    clearRecentlyViewed: (state) => {
      state.products = [];
    },
  },
});

export const {
  addRecentlyViewed,
  clearRecentlyViewed,
} = recentlyViewedSlice.actions;

export default recentlyViewedSlice.reducer;
