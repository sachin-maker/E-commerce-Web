
"use client";

import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "@/app/store";
import CartPersistence from "@/app/components/cart/CartPersistence";
import WishlistPersistence from "@/app/components/wishlist/WishlistPersistence";
import AuthPersistence from "@/app/components/auth/AuthPersistence";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({
  children,
}: ProvidersProps) {
  return (
    <Provider store={store}>
      <AuthPersistence />
      <CartPersistence />
      <WishlistPersistence />

      {children}

      <Toaster position="top-right" />
    </Provider>
  );
}


