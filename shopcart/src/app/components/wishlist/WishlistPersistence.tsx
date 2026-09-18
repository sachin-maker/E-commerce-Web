"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  Product,
} from "@/app/types/product";
import { setWishlistItems } from "@/app/store/slices/wishlistSlice";

const WISHLIST_STORAGE_KEY = "shopcart-wishlist";

export default function WishlistPersistence() {
  const dispatch = useAppDispatch();

  const wishlistItems = useAppSelector(
    (state) => state.wishlist.items
  );

  const [isHydrated, setIsHydrated] = useState(false);

  // Load wishlist from localStorage
  useEffect(() => {
    try {
      const storedWishlist = localStorage.getItem(
        WISHLIST_STORAGE_KEY
      );

      if (storedWishlist) {
        const parsedWishlist: Product[] =
          JSON.parse(storedWishlist);

        if (Array.isArray(parsedWishlist)) {
          dispatch(setWishlistItems(parsedWishlist));
        }
      }
    } catch (error) {
      console.error(
        "Error loading wishlist from localStorage:",
        error
      );
    } finally {
      setIsHydrated(true);
    }
  }, [dispatch]);

  // Save wishlist to localStorage
  useEffect(() => {
    if (!isHydrated) return;

    try {
      localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(wishlistItems)
      );
    } catch (error) {
      console.error(
        "Error saving wishlist to localStorage:",
        error
      );
    }
  }, [wishlistItems, isHydrated]);

  return null;
}