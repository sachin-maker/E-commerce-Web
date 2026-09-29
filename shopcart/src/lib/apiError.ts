type ApiErrorBody = {
  message?: string;
};

export const getApiErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (error instanceof Error) return error.message;

  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data &&
    typeof (error.data as ApiErrorBody).message === "string"
  ) {
    return (error.data as ApiErrorBody).message as string;
  }

  return fallback;
};

