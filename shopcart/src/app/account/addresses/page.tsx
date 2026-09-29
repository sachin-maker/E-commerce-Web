import type { Metadata } from "next";
import AddressesClient from "./AddressesClient";

export const metadata: Metadata = {
  title: "Your Addresses | ShopCart",
  description: "Manage your saved delivery addresses.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AddressesPage() {
  return <AddressesClient />;
}
