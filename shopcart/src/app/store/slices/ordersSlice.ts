import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem } from "./cartSlice";

export interface CustomerInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  payment: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  customer: CustomerInfo;
}

interface OrdersState {
  orders: Order[];
}

const initialState: OrdersState = {
  orders: [],
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },

    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },

    clearOrders: (state) => {
      state.orders = [];
    },
  },
});

export const { addOrder, setOrders, clearOrders } = ordersSlice.actions;

export default ordersSlice.reducer;