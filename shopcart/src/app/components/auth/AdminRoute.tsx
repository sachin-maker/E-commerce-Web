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

  const {
    isAuthenticated,
    isInitialized,
    user,
  } = useAppSelector((state) => state.auth);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    if (!isAuthenticated) {
      const returnPath = `${window.location.pathname}${window.location.search}`;

      router.replace(
        `/login?next=${encodeURIComponent(returnPath)}`
      );

      return;
    }

    if (!isAdmin) {
      router.replace("/");
    }
  }, [
    isAuthenticated,
    isAdmin,
    isInitialized,
    router,
  ]);

  if (
    !isInitialized ||
    !isAuthenticated ||
    !isAdmin
  ) {
    return (
      <div
        className="flex min-h-[300px] items-center justify-center"
        role="status"
        aria-live="polite"
      >
        <p>Checking permissions...</p>
      </div>
    );
  }

  return <>{children}</>;
}
