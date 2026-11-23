import { api } from "../axiosInstance";
import type { Admin, ApiResponse } from "../../types";

export interface CreateAdminValues {
  username: string;
  email: string;
  password: string;
  role: "admin";
}

export async function getAdmins(): Promise<Admin[]> {
  const response = await api.get<ApiResponse<Admin[]>>("/admins");
  return response.data.data;
}

export async function createAdmin(values: CreateAdminValues): Promise<Admin> {
  const response = await api.post<ApiResponse<Admin>>("/admins", values);
  return response.data.data;
}
