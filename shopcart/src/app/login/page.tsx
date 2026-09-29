import type { Metadata } from "next";

import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login | ShopCart",
  description: "Sign in to your ShopCart account.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return <LoginClient />;
}
