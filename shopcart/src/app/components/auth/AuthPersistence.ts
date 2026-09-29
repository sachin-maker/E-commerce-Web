"use client";

import { useEffect } from "react";
import { useGetProfileQuery } from "@/app/store/api/authApi";
import { getStoredAccessToken } from "@/lib/authStorage";
import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import {
  finishInitialization,
  logout,
  restoreToken,
  setCredentials,
} from "@/app/store/slices/authSlice";

export default function AuthPersistence() {
  const dispatch = useAppDispatch();

  const token = useAppSelector((state) => state.auth.token);
  const isInitialized = useAppSelector(
    (state) => state.auth.isInitialized
  );

  const {
    data,
    isError,
    isFetching,
  } = useGetProfileQuery(undefined, {
    skip: !token || isInitialized,
  });

  useEffect(() => {
    const storedToken = getStoredAccessToken();

    if (storedToken) {
      dispatch(restoreToken(storedToken));
    } else {
      dispatch(finishInitialization());
    }
  }, [dispatch]);

  useEffect(() => {
    if (!token || isInitialized || isFetching) {
      return;
    }

    if (data) {
      dispatch(
        setCredentials({
          token,
          user: data.user,
        })
      );

      return;
    }

    if (isError) {
      dispatch(logout());
    }
  }, [
    data,
    dispatch,
    isError,
    isFetching,
    isInitialized,
    token,
  ]);

  return null;
}
