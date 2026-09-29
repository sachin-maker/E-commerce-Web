"use client";

import type { ReactNode } from "react";

import ProtectedRoute from "@/app/components/auth/ProtectedRoute";

interface AccountLayoutProps {
  children: ReactNode;
}

export default function AccountLayout({
  children,
}: AccountLayoutProps) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
