"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/app/store/hooks";
import { logout } from "@/app/store/slices/authSlice";
import { clearStoredAccessToken } from "@/lib/authStorage";
import { changeUserPassword } from "@/services/authService";

import "./settings.css";

type PasswordField =
  | "currentPassword"
  | "newPassword"
  | "confirmPassword";

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  submit?: string;
}

export default function SettingsClient() {
  const dispatch = useAppDispatch();

  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  const [formData, setFormData] = useState<PasswordForm>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<PasswordErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [visibleFields, setVisibleFields] = useState<
    Record<PasswordField, boolean>
  >({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
      submit: undefined,
    }));

    setSuccessMessage("");
  };

  const togglePasswordVisibility = (
    field: PasswordField
  ) => {
    setVisibleFields((previous) => ({
      ...previous,
      [field]: !previous[field],
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: PasswordErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword =
        "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword =
        "New password is required";
    } else if (formData.newPassword.length < 6) {
      newErrors.newPassword =
        "New password must contain at least 6 characters";
    } else if (formData.newPassword.length > 128) {
      newErrors.newPassword =
        "New password cannot exceed 128 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your new password";
    } else if (
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword =
        "Passwords do not match";
    }

    if (
      formData.currentPassword &&
      formData.newPassword &&
      formData.currentPassword === formData.newPassword
    ) {
      newErrors.newPassword =
        "New password must be different from your current password";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSuccessMessage("");

    if (!token) {
      setErrors({
        submit:
          "Your session has expired. Please log in again.",
      });

      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await changeUserPassword(
        token,
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }
      );

      if (!response.success) {
        throw new Error(
          response.message ||
            "Unable to change password."
        );
      }

      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setErrors({});

      setSuccessMessage(
        "Password changed successfully."
      );
    } catch (error) {
      console.error(
        "Change password error:",
        error
      );

      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Unable to change password. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    clearStoredAccessToken();
  };

  const renderPasswordField = (
    field: PasswordField,
    label: string,
    autocomplete: string,
    error?: string
  ) => {
    const isVisible = visibleFields[field];

    return (
      <div className="settings-field">
        <label htmlFor={field}>
          {label}
        </label>

        <div className="settings-password-wrapper">
          <input
            id={field}
            name={field}
            type={isVisible ? "text" : "password"}
            value={formData[field]}
            onChange={handleChange}
            autoComplete={autocomplete}
            maxLength={128}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? `${field}-error` : undefined
            }
          />

          <button
            type="button"
            className="settings-password-toggle"
            onClick={() =>
              togglePasswordVisibility(field)
            }
            aria-label={
              isVisible
                ? `Hide ${label.toLowerCase()}`
                : `Show ${label.toLowerCase()}`
            }
          >
            {isVisible ? (
              <EyeOff
                size={18}
                aria-hidden="true"
              />
            ) : (
              <Eye
                size={18}
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        {error && (
          <p
            id={`${field}-error`}
            className="settings-field-error"
          >
            {error}
          </p>
        )}
      </div>
    );
  };

  return (
    <main
      className="settings-page"
      aria-labelledby="settings-title"
    >
      <div className="settings-container">
        <Link
          href="/account"
          className="settings-back-link"
        >
          <ArrowLeft
            size={17}
            aria-hidden="true"
          />
          Back to Account
        </Link>

        <header className="settings-header">
          <div>
            <h1 id="settings-title">
              Account Settings
            </h1>

            <p>
              Manage your account security and
              preferences.
            </p>
          </div>
        </header>

        <div className="settings-layout">
          <section
            className="settings-card"
            aria-labelledby="account-information-title"
          >
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <ShieldCheck
                  size={20}
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 id="account-information-title">
                  Account Information
                </h2>

                <p>
                  Your account is currently signed
                  in with this email address.
                </p>
              </div>
            </div>

            <div className="settings-account-info">
              <div>
                <span>Name</span>

                <strong>
                  {user?.name || "—"}
                </strong>
              </div>

              <div>
                <span>Email</span>

                <strong>
                  {user?.email || "—"}
                </strong>
              </div>
            </div>

            <Link
              href="/account/profile"
              className="settings-secondary-link"
            >
              Edit profile
            </Link>
          </section>

          <section
            className="settings-card"
            aria-labelledby="security-title"
          >
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <Lock
                  size={20}
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 id="security-title">
                  Change Password
                </h2>

                <p>
                  Use a strong password that you
                   dont reuse on other websites.
                </p>
              </div>
            </div>

            <form
              className="settings-password-form"
              onSubmit={handlePasswordChange}
              noValidate
            >
              {renderPasswordField(
                "currentPassword",
                "Current password",
                "current-password",
                errors.currentPassword
              )}

              {renderPasswordField(
                "newPassword",
                "New password",
                "new-password",
                errors.newPassword
              )}

              {renderPasswordField(
                "confirmPassword",
                "Confirm new password",
                "new-password",
                errors.confirmPassword
              )}

              {successMessage && (
                <div
                  className="settings-success"
                  role="status"
                  aria-live="polite"
                >
                  <CheckCircle
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    {successMessage}
                  </span>
                </div>
              )}

              {errors.submit && (
                <p
                  className="settings-submit-error"
                  role="alert"
                  aria-live="assertive"
                >
                  {errors.submit}
                </p>
              )}

              <button
                type="submit"
                className="settings-primary-button"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
              >
                {isSubmitting
                  ? "Changing Password..."
                  : "Change Password"}
              </button>
            </form>
          </section>

          <section
            className="settings-card settings-signout-card"
            aria-labelledby="signout-title"
          >
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <LogOut
                  size={20}
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 id="signout-title">
                  Sign Out
                </h2>

                <p>
                  Sign out of your ShopCart account
                  on this device.
                </p>
              </div>
            </div>

            <button
              type="button"
              className="settings-signout-button"
              onClick={handleLogout}
            >
              <LogOut
                size={17}
                aria-hidden="true"
              />
              Sign Out
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
