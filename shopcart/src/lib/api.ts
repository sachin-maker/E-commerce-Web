const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not defined");
}

interface ApiErrorResponse {
  success?: boolean;
  message?: string;
}

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `API request failed with status ${response.status}`;

    try {
      const data =
        (await response.json()) as ApiErrorResponse;

      if (
        typeof data.message === "string" &&
        data.message.trim()
      ) {
        message = data.message;
      }
    } catch {
      // Response was not valid JSON.
      // Keep the default HTTP error message.
    }

    throw new Error(message);
  }

  return response.json() as Promise<T>;
};
