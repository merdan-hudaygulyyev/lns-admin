import { api } from "../axiosInstance";
import type { ApiResponse, Member, MemberFormValues, MemberListParams } from "../../types";

function toFormData(values: MemberFormValues): FormData {
  const formData = new FormData();
  const entries: Array<[string, string | number | null | undefined]> = [
    ["username", values.username],
    ["password", values.password],
    ["fullName", values.fullName],
    ["motherName", values.motherName],
    ["heir", values.heir],
    ["passportNumber", values.passportNumber],
    ["birthDate", values.birthDate],
    ["secretQuestion", values.secretQuestion],
    ["secretAnswer", values.secretAnswer],
    ["email", values.email],
    ["pinCode", values.pinCode],
    ["phone", values.phone],
    ["inviter", values.inviter],
    ["product", values.product],
    ["address", values.address],
    ["postalIndex", values.postalIndex],
    ["officialSite", values.officialSite],
    ["registrationDate", values.registrationDate],
    ["amount", values.amount],
    ["currency", values.currency],
  ];

  for (const [key, value] of entries) {
    if (value !== undefined && value !== null) formData.append(key, String(value));
  }

  // New files are appended in gallery order, so `new:N` always points to the right file.
  let newIndex = 0;
  const order: string[] = [];

  for (const image of values.images) {
    if (image.path) {
      order.push(`existing:${image.path}`);
      continue;
    }
    if (image.file) {
      order.push(`new:${newIndex}`);
      formData.append("images", image.file);
      newIndex += 1;
    }
  }
  formData.append("imageOrder", JSON.stringify(order));

  return formData;
}

export async function getMembers(params: MemberListParams): Promise<ApiResponse<Member[]>> {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });
  const response = await api.get<ApiResponse<Member[]>>(`/members?${searchParams.toString()}`);
  return response.data;
}

export async function getMember(id: string): Promise<Member> {
  const response = await api.get<ApiResponse<Member>>(`/members/${id}`);
  return response.data.data;
}

export async function createMember(values: MemberFormValues): Promise<Member> {
  const response = await api.post<ApiResponse<Member>>("/members", toFormData(values));
  return response.data.data;
}

export async function updateMember(id: string, values: MemberFormValues): Promise<Member> {
  const response = await api.put<ApiResponse<Member>>(`/members/${id}`, toFormData(values));
  return response.data.data;
}

export async function deleteMember(id: string): Promise<void> {
  await api.delete(`/members/${id}`);
}
