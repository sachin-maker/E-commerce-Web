import type { Metadata } from "next";
import ProfileClient from "./ProfileClient";


export const metadata: Metadata = {
  title: "My Profile | ShopCart",
  description: "View and manage your ShopCart profile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
