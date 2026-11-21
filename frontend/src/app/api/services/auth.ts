import { api } from "../axiosInstance";
import type { Admin, ApiResponse } from "../../types";

export interface LoginValues {
  username: string;
  password: string;
}

export async function login(values: LoginValues): Promise<Admin> {
  const response = await api.post<ApiResponse<{ token: string; admin: Admin }>>(
    "/auth/login",
    values,
  );
  return response.data.data.admin;
}

export async function getMe(): Promise<Admin> {
  const response = await api.get<ApiResponse<Admin>>("/auth/me");
  return response.data.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}
