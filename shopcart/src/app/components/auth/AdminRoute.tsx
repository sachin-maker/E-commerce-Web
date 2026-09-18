"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@/app/store/hooks";

interface AdminRouteProps {
  children: React.ReactNode;
}

export default function AdminRoute({
  children,
}: AdminRouteProps) {
  const router = useRouter();

  const { isAuthenticated, user } = useAppSelector(
    (state) => state.auth
  );

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [isAuthenticated, isAdmin, router]);

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p>Checking permissions...</p>
      </div>
    );
  }

  return <>{children}</>;
}