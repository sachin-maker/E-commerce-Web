import type { Metadata } from "next";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Package,
  Settings,
  UserRound,
} from "lucide-react";

import "./account.css";

export const metadata: Metadata = {
  title: "My Account | ShopCart",
  description:
    "Manage your ShopCart account, orders, wishlist, addresses and settings.",
  robots: {
    index: false,
    follow: false,
  },
};

const accountItems = [
  {
    title: "Profile",
    description: "Manage your personal information",
    href: "/account/profile",
    icon: UserRound,
  },
  {
    title: "Orders",
    description: "View and track your orders",
    href: "/orders",
    icon: Package,
  },
  {
    title: "Wishlist",
    description: "View your saved products",
    href: "/wishlist",
    icon: Heart,
  },
  {
    title: "Addresses",
    description: "Manage your delivery addresses",
    href: "/account/addresses",
    icon: MapPin,
  },
  {
    title: "Account Settings",
    description: "Manage your account preferences",
    href: "/account/settings",
    icon: Settings,
  },
];

export default function AccountPage() {
  return (
    <main className="account-page">
      <div className="account-container">
        <header className="account-page-header">
          <p className="account-eyebrow">My Account</p>

          <h1>Account Overview</h1>

          <p>
            Manage your ShopCart account, orders, wishlist,
            addresses and preferences.
          </p>
        </header>

        <section
          className="account-card-grid"
          aria-label="Account options"
        >
          {accountItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.title}
                href={item.href}
                className="account-option-card"
              >
                <span className="account-option-icon">
                  <Icon
                    size={22}
                    aria-hidden="true"
                  />
                </span>

                <span className="account-option-content">
                  <strong>{item.title}</strong>

                  <span>{item.description}</span>
                </span>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}
