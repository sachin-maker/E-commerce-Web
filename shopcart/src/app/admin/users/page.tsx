
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import AdminRoute from "@/app/components/auth/AdminRoute";
import { useGetAdminUsersQuery } from "@/app/store/api/adminApi";
import styles from "../AdminPages.module.css";

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatRole = (role: "user" | "admin"): string => {
  return role === "admin" ? "Admin" : "User";
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    refetch,
  } = useGetAdminUsersQuery({
    page,
    limit: 20,
  });

  const totalPages = useMemo(
    () => Math.max(data?.pagination?.pages ?? 1, 1),
    [data?.pagination?.pages],
  );

  const users = data?.users ?? [];
  const totalUsers = data?.pagination?.total ?? 0;
  const hasUsers = users.length > 0;

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <AdminRoute>
      <main className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <div>
              <h1>Manage users</h1>

              <p>
                View registered customer and administrator
                accounts.
              </p>
            </div>

            <span
              className={styles.count}
              aria-label={`Total users: ${totalUsers}`}
            >
              {totalUsers}{" "}
              {totalUsers === 1 ? "user" : "users"}
            </span>
          </header>

          {isLoading && (
            <section
              className={styles.state}
              role="status"
              aria-live="polite"
            >
              Loading users...
            </section>
          )}

          {isError && !isLoading && (
            <section
              className={styles.error}
              role="alert"
            >
              <p>Unable to load users.</p>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                {isFetching ? "Retrying..." : "Try again"}
              </button>
            </section>
          )}

          {!isLoading && !isError && (
            <>
              <div className={styles.tableWrap}>
                {hasUsers ? (
                  <table className={styles.table}>
                    <caption
                      className={styles.visuallyHidden}
                    >
                      Registered users
                    </caption>

                    <thead>
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Email</th>
                        <th scope="col">Role</th>
                        <th scope="col">Joined</th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((user) => (
                        <tr key={user._id}>
                          <td>
                            <strong>
                              {user.name || "Unnamed user"}
                            </strong>
                          </td>

                          <td>
                            {user.email || "Email unavailable"}
                          </td>

                          <td>
                            <span
                              className={`${styles.badge} ${
                                user.role === "admin"
                                  ? styles.admin
                                  : styles.user
                              }`}
                            >
                              {formatRole(user.role)}
                            </span>
                          </td>

                          <td className={styles.muted}>
                            {formatDate(user.createdAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p
                    className={styles.state}
                    role="status"
                  >
                    No users found.
                  </p>
                )}
              </div>

              {totalPages > 1 && (
                <nav
                  className={styles.pagination}
                  aria-label="User pagination"
                >
                  <button
                    type="button"
                    disabled={page <= 1 || isFetching}
                    onClick={() =>
                      setPage((currentPage) =>
                        Math.max(currentPage - 1, 1),
                      )
                    }
                  >
                    Previous
                  </button>

                  <span
                    className={styles.muted}
                    aria-live="polite"
                  >
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={
                      page >= totalPages || isFetching
                    }
                    onClick={() =>
                      setPage((currentPage) =>
                        Math.min(
                          currentPage + 1,
                          totalPages,
                        ),
                      )
                    }
                  >
                    Next
                  </button>
                </nav>
              )}

              {isFetching && !isLoading && (
                <p
                  className={styles.visuallyHidden}
                  role="status"
                  aria-live="polite"
                >
                  Loading updated user data...
                </p>
              )}
            </>
          )}

          <div className={styles.pageFooter}>
            <Link
              href="/admin/dashboard"
              className={styles.link}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </main>
    </AdminRoute>
  );
}


