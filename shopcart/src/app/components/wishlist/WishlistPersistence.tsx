"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import type { Product } from "@/app/types/product";
import { setWishlistItems } from "@/app/store/slices/wishlistSlice";
import { isValidProduct } from "@/app/utils/productValidation";

const WISHLIST_STORAGE_KEY = "shopcart-wishlist";
const WISHLIST_STORAGE_VERSION = 1;

interface StoredWishlist {
  version: number;
  items: Product[];
}



const parseStoredWishlist = (storedValue: string): Product[] => {
  try {
    const parsed: unknown = JSON.parse(storedValue);

    // Current versioned format
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "version" in parsed &&
      "items" in parsed
    ) {
      const stored = parsed as StoredWishlist;

      if (
        stored.version === WISHLIST_STORAGE_VERSION &&
        Array.isArray(stored.items)
      ) {
        return stored.items.filter(isValidProduct);
      }

      return [];
    }

    // Backward compatibility with the previous raw array format
    if (Array.isArray(parsed)) {
      return parsed.filter(isValidProduct);
    }

    return [];
  } catch {
    return [];
  }
};

export default function WishlistPersistence() {
  const dispatch = useAppDispatch();

  const wishlistItems = useAppSelector(
    (state) => state.wishlist.items
  );

  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const storedWishlist = localStorage.getItem(
      WISHLIST_STORAGE_KEY
    );

    if (storedWishlist) {
      const parsedWishlist = parseStoredWishlist(storedWishlist);

      if (parsedWishlist.length > 0) {
        dispatch(setWishlistItems(parsedWishlist));
      }
    }

    setIsHydrated(true);
  }, [dispatch]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const dataToStore: StoredWishlist = {
      version: WISHLIST_STORAGE_VERSION,
      items: wishlistItems,
    };

    try {
      localStorage.setItem(
        WISHLIST_STORAGE_KEY,
        JSON.stringify(dataToStore)
      );
    } catch {
      // Ignore localStorage failures such as quota/private-mode restrictions.
    }
  }, [wishlistItems, isHydrated]);

  return null;
}
