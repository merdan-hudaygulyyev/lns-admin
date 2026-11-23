export const ROUTES = {
  login: "/login",
  members: "/members",
  memberNew: "/members/new",
  admins: "/admins",
  profile: "/profile",
} as const;

export function memberDetails(id: string): string {
  return `/members/${id}`;
}

export function memberEdit(id: string): string {
  return `/members/${id}/edit`;
}
