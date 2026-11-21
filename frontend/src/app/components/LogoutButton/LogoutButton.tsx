"use client";

import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { logout } from "../../api/services/auth";
import { useRouter } from "../../../i18n/navigation";
import { ROUTES } from "../../utils/routes";

interface LogoutButtonProps {
  collapsed?: boolean;
  mobileOpen?: boolean;
}

export function LogoutButton({ collapsed, mobileOpen }: LogoutButtonProps) {
  const t = useTranslations("nav");
  const router = useRouter();

  const mutation = useMutation({
    mutationFn: logout,
    onSettled: () => {
      router.replace(ROUTES.login);
      router.refresh();
    },
  });

  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      title={t("logout")}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-danger transition hover:bg-danger/10 disabled:opacity-60 ${
        collapsed ? "lg:justify-center lg:px-0" : ""
      }`}
    >
      <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
      {(!collapsed || mobileOpen) && <span>{t("logout")}</span>}
    </button>
  );
}
