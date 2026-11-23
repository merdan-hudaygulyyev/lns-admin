import { useQuery } from "@tanstack/react-query";
import { getMe } from "../api/services/auth";

export function useCurrentAdmin() {
  return useQuery({
    queryKey: ["me"],
    queryFn: getMe,
  });
}
