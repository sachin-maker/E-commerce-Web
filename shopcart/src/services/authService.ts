import { apiRequest } from "@/lib/api";


export interface UpdateProfileData {
  name?: string;
  email?: string;
}


export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  userId: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token: string;
  user: User;
}

export interface ProfileResponse {
  success: boolean;
  user: User;
}

export const registerUser = async (
  userData: RegisterData
): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const loginUser = async (
  userData: LoginData
): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const getUserProfile = async (
  token: string
): Promise<ProfileResponse> => {
  return apiRequest<ProfileResponse>("/users/profile", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateUserProfile = async (
  token: string,
  userData: UpdateProfileData
): Promise<ProfileResponse & { message: string }> => {
  return apiRequest<ProfileResponse & { message: string }>(
    "/users/profile",
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    }
  );
};

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

export const changeUserPassword = async (
  token: string,
  passwordData: ChangePasswordData
): Promise<ChangePasswordResponse> => {
  return apiRequest<ChangePasswordResponse>(
    "/users/profile/password",
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordData),
    }
  );
};
