"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { useAppSelector } from "@/app/store/hooks";

import "./profile.css";

export default function ProfileClient() {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return (
      <main className="profile-page">
        <div className="profile-container">
          <div className="profile-error">
            <h1>Profile unavailable</h1>

            <p>
              We could not find your account information.
            </p>

            <Link
              href="/account"
              className="profile-back-button"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Back to Account
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="profile-page">
      <div className="profile-container">
        <div className="profile-breadcrumb">
          <Link href="/account">
            <ArrowLeft size={16} aria-hidden="true" />
            My Account
          </Link>
        </div>

        <header className="profile-header">
          <div>
            <p className="profile-eyebrow">
              Your Account
            </p>

            <h1>My Profile</h1>

            <p>
              View your personal account information.
            </p>
          </div>
        </header>

        <section className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar">
              <UserRound
                size={34}
                aria-hidden="true"
              />
            </div>

            <div>
              <h2>{user.name}</h2>

              <p>{user.email}</p>
            </div>
          </div>

          <div className="profile-divider" />

          <div className="profile-information">
            <div className="profile-information-item">
              <div className="profile-information-icon">
                <UserRound
                  size={20}
                  aria-hidden="true"
                />
              </div>

              <div>
                <span>Name</span>
                <strong>{user.name}</strong>
              </div>
            </div>

            <div className="profile-information-item">
              <div className="profile-information-icon">
                <Mail
                  size={20}
                  aria-hidden="true"
                />
              </div>

              <div>
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>
            </div>

            <div className="profile-information-item">
              <div className="profile-information-icon">
                <ShieldCheck
                  size={20}
                  aria-hidden="true"
                />
              </div>

              <div>
                <span>Account Type</span>

                <strong>
                  {user.role === "admin"
                    ? "Administrator"
                    : "Customer"}
                </strong>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
