const ACCESS_TOKEN_KEY = "shopcart.accessToken";

export const getStoredAccessToken = (): string | null => {
  if (typeof window === "undefined") return null;

  return (
    window.localStorage.getItem(ACCESS_TOKEN_KEY) ??
    window.localStorage.getItem("token")
  );
};

export const storeAccessToken = (token: string): void => {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const clearStoredAccessToken = (): void => {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  // Removes credentials created by the previous auth implementation.
  window.localStorage.removeItem("token");
  window.localStorage.removeItem("user");
};

