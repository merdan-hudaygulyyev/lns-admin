"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import * as yup from "yup";
import { getErrorMessage, getFieldErrors } from "../../api/axiosInstance";
import { createAdmin, type CreateAdminValues } from "../../api/services/admins";
import { Button, Input, Modal, Select } from "../../compLibrary";

const EMPTY_FORM: CreateAdminValues = {
  username: "",
  email: "",
  password: "",
  role: "admin",
};

interface AddAdminModalProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

export function AddAdminModal({ open, onClose, onCreated }: AddAdminModalProps) {
  const t = useTranslations("admins");
  const validation = useTranslations("validation");
  const common = useTranslations("common");
  const queryClient = useQueryClient();

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
    role: yup.mixed<"admin">().oneOf(["admin"]).required(),
  });

  const mutation = useMutation({
    mutationFn: (values: CreateAdminValues) => createAdmin(values),
    onSuccess: async () => {
      toast.success(t("toasts.created"));
      formik.resetForm();
      onClose();
      onCreated?.();
      await queryClient.invalidateQueries({ queryKey: ["admins"] });
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

  return (
    <Modal
      open={open}
      title={t("formTitle")}
      onClose={onClose}
      disableOutClick={mutation.isPending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            {common("cancel")}
          </Button>
          <Button
            type="submit"
            form="add-admin-form"
            loading={mutation.isPending}
            loadingText={common("creating")}
          >
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            {common("create")}
          </Button>
        </>
      }
    >
      <p className="mb-4 text-sm text-muted">{t("formSubtitle")}</p>
      <form id="add-admin-form" onSubmit={formik.handleSubmit} noValidate className="space-y-4">
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
        <div>
          <Select
            label={t("fields.role")}
            name="role"
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={fieldError("role")}
            options={[{ value: "admin", label: t("roles.admin") }]}
          />
          <p className="mt-1 text-xs text-muted">{t("fields.roleHint")}</p>
        </div>
      </form>
    </Modal>
  );
}
