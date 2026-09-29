
"use client";

import { useEffect, useRef } from "react";

import { getCart } from "@/services/cartService";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { setCartItems, clearCart } from "@/app/store/slices/cartSlice";

export default function CartPersistence() {
  const dispatch = useAppDispatch();

  const token = useAppSelector(
    (state) => state.auth.token
  );

  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  const isInitialized = useAppSelector(
    (state) => state.auth.isInitialized
  );

  const hasLoadedCart = useRef(false);

  useEffect(() => {
    if (
      !isInitialized ||
      !isAuthenticated ||
      !token
    ) {
      return;
    }

    if (hasLoadedCart.current) {
      return;
    }

    let isMounted = true;

    const loadCart = async () => {
      try {
        const response = await getCart(token);

        if (!isMounted) {
          return;
        }

        dispatch(
          setCartItems(
            response.cart.items
          )
        );

        hasLoadedCart.current = true;
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error(
          "Failed to load cart from server:",
          error
        );
      }
    };

    loadCart();

    return () => {
      isMounted = false;
    };
  }, [
    dispatch,
    isAuthenticated,
    isInitialized,
    token,
  ]);

 useEffect(() => {
  if (!isAuthenticated) {
    hasLoadedCart.current = false;
    dispatch(clearCart());
  }
}, [dispatch, isAuthenticated]);

  return null;
}


