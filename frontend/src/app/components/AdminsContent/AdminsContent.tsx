"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import * as yup from "yup";
import { getErrorMessage, getFieldErrors } from "../../api/axiosInstance";
import { createAdmin, getAdmins, type CreateAdminValues } from "../../api/services/admins";
import { Button, Card, Input, Loader, Select } from "../../compLibrary";
import { useCurrentAdmin } from "../../hooks/useCurrentAdmin";
import type { AdminRole } from "../../types";
import { formatDate } from "../../utils/format";

const EMPTY_FORM: CreateAdminValues = {
  username: "",
  email: "",
  password: "",
  role: "admin",
  fullName: "",
};

export function AdminsContent() {
  const t = useTranslations("admins");
  const validation = useTranslations("validation");
  const common = useTranslations("common");
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { data: currentAdmin, isPending: mePending } = useCurrentAdmin();
  const isSuperAdmin = currentAdmin?.role === "super_admin";

  const adminsQuery = useQuery({
    queryKey: ["admins"],
    queryFn: getAdmins,
    enabled: isSuperAdmin,
  });

  const schema = yup.object({
    username: yup
      .string()
      .required(validation("required", { field: t("fields.username") }))
      .min(2, validation("min", { field: t("fields.username"), min: 2 }))
      .max(100, validation("max", { field: t("fields.username"), max: 100 })),
    email: yup
      .string()
      .required(validation("required", { field: t("fields.email") }))
      .email(validation("email")),
    password: yup
      .string()
      .required(validation("required", { field: t("fields.password") }))
      .min(8, validation("min", { field: t("fields.password"), min: 8 })),
    role: yup
      .mixed<AdminRole>()
      .oneOf(["super_admin", "admin"])
      .required(validation("required", { field: t("fields.role") })),
    fullName: yup.string().max(255, validation("max", { field: t("fields.fullName"), max: 255 })),
  });

  const mutation = useMutation({
    mutationFn: (values: CreateAdminValues) => createAdmin(values),
    onSuccess: async () => {
      toast.success(t("toasts.created"));
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
      formik.resetForm();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, t("toasts.createFailed")));
      const backendErrors = getFieldErrors(error);
      if (backendErrors) formik.setErrors({ ...formik.errors, ...backendErrors });
    },
  });

  const formik = useFormik<CreateAdminValues>({
    initialValues: EMPTY_FORM,
    validationSchema: schema,
    onSubmit: (values) => mutation.mutate(values),
  });

  const fieldError = (name: keyof CreateAdminValues): string | undefined => {
    const error = formik.errors[name];
    return formik.touched[name] && typeof error === "string" ? error : undefined;
  };

  if (mePending) {
    return <Card><Loader label={common("loading")} /></Card>;
  }

  if (!isSuperAdmin) {
    return (
      <Card>
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-danger" aria-hidden="true" />
          <div>
            <h1 className="text-lg font-semibold text-ink">{t("forbiddenTitle")}</h1>
            <p className="mt-1 text-sm text-muted">{t("forbiddenDescription")}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
      </header>

      <Card title={t("formTitle")} subtitle={t("formSubtitle")}>
        <form onSubmit={formik.handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <Input
            label={t("fields.username")}
            name="username"
            value={formik.values.username}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={fieldError("username")}
            autoComplete="username"
          />
          <Input
            label={t("fields.email")}
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={fieldError("email")}
            autoComplete="email"
          />
          <Input
            label={t("fields.password")}
            name="password"
            type="password"
            hint={t("passwordHint")}
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={fieldError("password")}
            autoComplete="new-password"
          />
          <Select
            label={t("fields.role")}
            name="role"
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={fieldError("role")}
            options={[
              { value: "admin", label: t("roles.admin") },
              { value: "super_admin", label: t("roles.super_admin") },
            ]}
          />
          <Input
            label={t("fields.fullName")}
            name="fullName"
            value={formik.values.fullName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={fieldError("fullName")}
          />
          <div className="flex items-end sm:justify-end">
            <Button type="submit" loading={mutation.isPending} loadingText={common("creating")}>
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              {common("create")}
            </Button>
          </div>
        </form>
      </Card>

      <Card title={t("listTitle")}>
        {adminsQuery.isPending ? (
          <Loader label={t("loading")} />
        ) : adminsQuery.isError ? (
          <p className="text-sm text-danger">{t("error")}</p>
        ) : adminsQuery.data.length === 0 ? (
          <p className="text-sm text-muted">{t("empty")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2">{t("table.username")}</th>
                  <th className="px-3 py-2">{t("table.email")}</th>
                  <th className="px-3 py-2">{t("table.fullName")}</th>
                  <th className="px-3 py-2">{t("table.role")}</th>
                  <th className="px-3 py-2">{t("table.createdAt")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {adminsQuery.data.map((admin) => (
                  <tr key={admin.id} className="hover:bg-surface-2">
                    <td className="px-3 py-3 font-medium text-ink">{admin.username}</td>
                    <td className="px-3 py-3 text-muted">{admin.email}</td>
                    <td className="px-3 py-3 text-muted">{admin.fullName}</td>
                    <td className="px-3 py-3">
                      <span className="rounded-full bg-brand/10 px-2 py-1 text-xs font-medium text-brand">
                        {t(`roles.${admin.role}`)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-muted">{formatDate(admin.createdAt.slice(0, 10), locale)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
