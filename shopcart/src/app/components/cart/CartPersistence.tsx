"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  CartItem,
  setCartItems,
} from "@/app/store/slices/cartSlice";

const CART_STORAGE_KEY = "shopcart-items";

export default function CartPersistence() {
  const dispatch = useAppDispatch();

  const cartItems = useAppSelector(
    (state) => state.cart.items
  );

  const [isHydrated, setIsHydrated] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem(
        CART_STORAGE_KEY
      );

      console.log("Stored cart:", storedCart);

      if (storedCart) {
        const parsedCart: CartItem[] = JSON.parse(storedCart);

        if (Array.isArray(parsedCart)) {
          dispatch(setCartItems(parsedCart));
        }
      }
    } catch (error) {
      console.error(
        "Error loading cart from localStorage:",
        error
      );
    } finally {
      setIsHydrated(true);
    }
  }, [dispatch]);

  // Save cart only after localStorage loading is completed
  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );

      console.log("Saved cart:", cartItems);
    } catch (error) {
      console.error(
        "Error saving cart to localStorage:",
        error
      );
    }
  }, [cartItems, isHydrated]);

  return null;
}