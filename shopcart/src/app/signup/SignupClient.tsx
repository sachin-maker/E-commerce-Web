"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";

import { useRegisterMutation } from "@/app/store/api/authApi";
import { useAppDispatch } from "@/app/store/hooks";
import { setCredentials } from "@/app/store/slices/authSlice";
import { storeAccessToken } from "@/lib/authStorage";
import { getApiErrorMessage } from "@/lib/apiError";
import styles from "../auth.module.css";




export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [register, { isLoading }] =
    useRegisterMutation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !normalizedName ||
      !normalizedEmail ||
      !password
    ) {
      toast.error("All fields are required");
      return;
    }

    if (password.length < 6) {
      toast.error(
        "Password must contain at least 6 characters"
      );
      return;
    }

    try {
      const response = await register({
        name: normalizedName,
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

      router.replace("/");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Registration failed"
        )
      );
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          Create Account
        </h1>

        <p className={styles.description}>
          Sign up to start shopping.
        </p>

        <form
          onSubmit={handleSubmit}
          className={styles.form}
        >
          <div className={styles.field}>
            <label htmlFor="name">
              Full Name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your name"
              className={styles.input}
              autoComplete="name"
              required
            />
          </div>

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
              placeholder="Minimum 6 characters"
              className={styles.input}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            aria-busy={isLoading}
            className={styles.submitButton}
          >
            {isLoading
              ? "Creating account..."
              : "Sign Up"}
          </button>
        </form>

        <p className={styles.footerText}>
          Already have an account?{" "}
          <Link
            href="/login"
            className={styles.link}
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
