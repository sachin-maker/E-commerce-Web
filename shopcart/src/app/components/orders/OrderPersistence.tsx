"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { Order, setOrders } from "@/app/store/slices/ordersSlice";

const ORDERS_STORAGE_KEY = "shopcart-orders";

export default function OrderPersistence() {
  const dispatch = useAppDispatch();

  const orders = useAppSelector((state) => state.orders.orders);

  const [isHydrated, setIsHydrated] = useState(false);

  // Load orders from localStorage when the app starts
  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);

      if (storedOrders) {
        const parsedOrders: Order[] = JSON.parse(storedOrders);

        if (Array.isArray(parsedOrders)) {
          dispatch(setOrders(parsedOrders));
        }
      }
    } catch (error) {
      console.error("Error loading orders from localStorage:", error);
    } finally {
      setIsHydrated(true);
    }
  }, [dispatch]);

  // Save orders whenever Redux orders change
  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(
        ORDERS_STORAGE_KEY,
        JSON.stringify(orders)
      );
    } catch (error) {
      console.error("Error saving orders to localStorage:", error);
    }
  }, [orders, isHydrated]);

  return null;
}