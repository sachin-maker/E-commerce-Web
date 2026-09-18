import { configureStore } from "@reduxjs/toolkit";
import { dummyJsonApi } from "./api/dummyJsonApi";
import cartReducer from "./slices/cartSlice";
import ordersReducer from "./slices/ordersSlice";
import wishlistReducer from "./slices/wishlistSlice";
import recentlyViewedReducer from "./slices/recentlyViewedSlice";
import authReducer from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    [dummyJsonApi.reducerPath]: dummyJsonApi.reducer,
    auth: authReducer,
    cart: cartReducer,
    orders: ordersReducer,
    wishlist: wishlistReducer,
    recentlyViewed: recentlyViewedReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(dummyJsonApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;