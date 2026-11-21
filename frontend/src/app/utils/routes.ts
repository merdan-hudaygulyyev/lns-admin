export const ROUTES = {
  login: "/login",
  members: "/members",
  memberNew: "/members/new",
  profile: "/profile",
} as const;

export function memberDetails(id: string): string {
  return `/members/${id}`;
}

export function memberEdit(id: string): string {
  return `/members/${id}/edit`;
}
