import { baseApi } from "./baseApi";
import type {
  AuthResponse,
  LoginData,
  ProfileResponse,
  RegisterData,
  User,
} from "@/services/authService";

type ProfileApiResponse = {
  success: boolean;
  user: Omit<User, "userId"> & { _id?: string; userId?: string };
};

const normalizeUser = (user: ProfileApiResponse["user"]): User => ({
  userId: user.userId ?? user._id ?? "",
  name: user.name,
  email: user.email,
  role: user.role,
});

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<AuthResponse, LoginData>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<AuthResponse, RegisterData>({
      query: (registration) => ({
        url: "/auth/register",
        method: "POST",
        body: registration,
      }),
    }),
    getProfile: builder.query<ProfileResponse, void>({
      query: () => "/users/profile",
      transformResponse: (response: ProfileApiResponse): ProfileResponse => ({
        success: response.success,
        user: normalizeUser(response.user),
      }),
      providesTags: ["Profile"],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useLoginMutation,
  useRegisterMutation,
} = authApi;

