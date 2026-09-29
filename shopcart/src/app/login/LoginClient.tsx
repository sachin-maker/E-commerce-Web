"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { useLoginMutation } from "@/app/store/api/authApi";
import { useAppDispatch } from "@/app/store/hooks";
import { setCredentials } from "@/app/store/slices/authSlice";
import { storeAccessToken } from "@/lib/authStorage";
import { getApiErrorMessage } from "@/lib/apiError";
import styles from "../auth.module.css";



export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      toast.error("Email and password are required");
      return;
    }

    try {
      const response = await login({
        email: normalizedEmail,
        password,
      }).unwrap();

      dispatch(
        setCredentials({
          token: response.token,
          user: response.user,
        })
      );

      storeAccessToken(response.token);

      toast.success(response.message);

      const nextPath = new URLSearchParams(
        window.location.search
      ).get("next");

      const isSafeNextPath =
        typeof nextPath === "string" &&
        nextPath.startsWith("/") &&
        !nextPath.startsWith("//");

      const destination = isSafeNextPath
        ? nextPath
        : response.user.role === "admin"
          ? "/admin"
          : "/";

      router.replace(destination);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Login failed")
      );
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>

        <p className={styles.description}>
          Login to continue shopping.
        </p>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >
          <div className={styles.field}>
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              className={styles.input}
              autoComplete="email"
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter your password"
              className={styles.input}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className={styles.submitButton}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className={styles.footerText}>
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className={styles.link}
          >
            Create account
          </Link>
        </p>
      </div>
    </main>
  );
}
