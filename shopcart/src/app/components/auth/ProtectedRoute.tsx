"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAppSelector } from "@/app/store/hooks";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const router = useRouter();

  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      const returnPath = `${window.location.pathname}${window.location.search}`;
      router.replace(`/login?next=${encodeURIComponent(returnPath)}`);
    }
  }, [isAuthenticated, isInitialized, router]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="protected-route-loading">
        <p>Checking authentication...</p>
      </div>
    );
  }

  return <>{children}</>;
}

