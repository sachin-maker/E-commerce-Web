"use client";

import { useEffect } from "react";
import { useAppDispatch } from "@/app/store/hooks";
import { setCredentials } from "@/app/store/slices/authSlice";
import type { User } from "@/services/authService";

export default function AuthPersistence() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userString = localStorage.getItem("user");

    if (!token || !userString) return;

    try {
      const user = JSON.parse(userString) as User;

      dispatch(
        setCredentials({
          token,
          user,
        })
      );
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    }
  }, [dispatch]);

  return null;
}