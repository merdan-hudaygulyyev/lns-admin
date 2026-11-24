"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, LockKeyhole, UserRound } from "lucide-react";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { useState } from "react";
import * as yup from "yup";
import { getErrorMessage } from "../../api/axiosInstance";
import { login } from "../../api/services/auth";
import { Button, Input } from "../../compLibrary";
import { BrandLogo } from "../BrandLogo/BrandLogo";
import { useRouter } from "../../../i18n/navigation";
import { ROUTES } from "../../utils/routes";

export function LoginForm() {
  const t = useTranslations("login");
  const validation = useTranslations("validation");
  const common = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const schema = yup.object({
    username: yup.string().required(validation("required", { field: t("username") })),
    password: yup.string().required(validation("required", { field: t("password") })),
  });

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (admin) => {
      queryClient.setQueryData(["me"], admin);
      router.replace(ROUTES.members);
      router.refresh();
    },
    onError: (error: unknown) => {
      setServerError(getErrorMessage(error, t("errorTitle")));
    },
  });

  const formik = useFormik({
    initialValues: { username: "", password: "" },
    validationSchema: schema,
    onSubmit: (values) => {
      setServerError(null);
      mutation.mutate(values);
    },
  });

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="mb-8 text-center">
        <BrandLogo className="mx-auto h-16 w-[212px]" alt={common("appName")} />
      </div>

      <form onSubmit={formik.handleSubmit} className="card space-y-5 p-6 sm:p-8" noValidate>
        {serverError && (
          <div role="alert" className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2.5 text-sm text-danger">
            {serverError}
          </div>
        )}

        <Input
          label={t("username")}
          name="username"
          placeholder={t("usernamePlaceholder")}
          autoComplete="username"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.username ? formik.errors.username : undefined}
          rightSlot={<UserRound className="h-4 w-4 text-muted" aria-hidden="true" />}
        />

        <Input
          label={t("password")}
          name="password"
          type={showPassword ? "text" : "password"}
          placeholder={t("passwordPlaceholder")}
          autoComplete="current-password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password ? formik.errors.password : undefined}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="rounded-md p-1 text-muted hover:text-ink"
              aria-label={showPassword ? t("hidePassword") : t("showPassword")}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Eye className="h-4 w-4" aria-hidden="true" />
              )}
            </button>
          }
        />

        <Button type="submit" loading={mutation.isPending} loadingText={t("submitting")} className="w-full">
          <LockKeyhole className="h-4 w-4" aria-hidden="true" />
          {t("submit")}
        </Button>
      </form>

      {/* <p className="mt-6 text-center text-xs text-muted">{t("footer")}</p> */}
      <p className="sr-only">{common("appName")}</p>
    </div>
  );
}
