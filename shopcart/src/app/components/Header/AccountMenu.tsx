"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type { User } from "@/services/authService";

interface AccountMenuProps {
  user: User;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function AccountMenu({
  user,
  isAdmin,
  onLogout,
}: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const menuId = "account-menu-dropdown";

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        wrapperRef.current?.contains(target)
      ) {
        return;
      }

      setIsOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [user.userId]);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div
      ref={wrapperRef}
      className="account-menu-wrapper"
    >
      <button
        ref={triggerRef}
        type="button"
        className="account-menu-trigger"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() =>
          setIsOpen((current) => !current)
        }
      >
        <span
          className="account-menu-trigger-icon"
          aria-hidden="true"
        >
          <UserRound size={23} />
        </span>

        <span className="account-menu-trigger-text">
          <small>
            Hello, {user.name || "User"}
          </small>

          <strong>Account</strong>
        </span>

        <ChevronDown
          size={17}
          aria-hidden="true"
          className={
            isOpen
              ? "account-menu-chevron-open"
              : undefined
          }
        />
      </button>

      {isOpen && (
        <div
          id={menuId}
          className="account-menu-dropdown"
        >
          <div className="account-menu-user">
            <div
              className="account-menu-user-icon"
              aria-hidden="true"
            >
              <UserRound size={21} />
            </div>

            <div className="account-menu-user-details">
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
          </div>

          <div
            className="account-menu-divider"
            aria-hidden="true"
          />

          <nav
            className="account-menu-section"
            aria-label="Account navigation"
          >
            <p className="account-menu-section-title">
              My Account
            </p>

            <Link
              href="/account/profile"
              className="account-menu-item"
              onClick={closeMenu}
            >
              <UserRound
                size={18}
                aria-hidden="true"
              />

              <span>My Profile</span>
            </Link>

            <Link
              href="/orders"
              className="account-menu-item"
              onClick={closeMenu}
            >
              <Package
                size={18}
                aria-hidden="true"
              />

              <span>My Orders</span>
            </Link>

            <Link
              href="/wishlist"
              className="account-menu-item"
              onClick={closeMenu}
            >
              <Heart
                size={18}
                aria-hidden="true"
              />

              <span>Wishlist</span>
            </Link>

            <Link
              href="/account/addresses"
              className="account-menu-item"
              onClick={closeMenu}
            >
              <MapPin
                size={18}
                aria-hidden="true"
              />

              <span>Addresses</span>
            </Link>

            <Link
              href="/account/settings"
              className="account-menu-item"
              onClick={closeMenu}
            >
              <Settings
                size={18}
                aria-hidden="true"
              />

              <span>Account Settings</span>
            </Link>
          </nav>

          {isAdmin && (
            <>
              <div
                className="account-menu-divider"
                aria-hidden="true"
              />

              <div className="account-menu-section">
                <Link
                  href="/admin"
                  className="account-menu-item account-menu-admin-item"
                  onClick={closeMenu}
                >
                  <ShieldCheck
                    size={18}
                    aria-hidden="true"
                  />

                  <span>Admin Dashboard</span>
                </Link>
              </div>
            </>
          )}

          <div
            className="account-menu-divider"
            aria-hidden="true"
          />

          <div className="account-menu-section">
            <button
              type="button"
              className="account-menu-item account-menu-logout"
              onClick={handleLogout}
            >
              <LogOut
                size={18}
                aria-hidden="true"
              />

              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
