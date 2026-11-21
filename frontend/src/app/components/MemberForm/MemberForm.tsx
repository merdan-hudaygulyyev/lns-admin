"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef } from "react";
import toast from "react-hot-toast";
import * as yup from "yup";
import { getErrorMessage, getFieldErrors } from "../../api/axiosInstance";
import { createMember, updateMember } from "../../api/services/members";
import { Button, Card, Input, Select } from "../../compLibrary";
import { useRouter } from "../../../i18n/navigation";
import {
  EMPTY_MEMBER_FORM,
  type Currency,
  type Member,
  type MemberFormValues,
  type UploadImage,
} from "../../types";
import { ROUTES } from "../../utils/routes";
import { createUploadImages, revokePreview, revokePreviews, savedImages } from "../../utils/uploadImages";
import { ImageDropzone } from "../ImageDropzone/ImageDropzone";

interface MemberFormProps {
  mode: "create" | "edit";
  member?: Member;
  memberId?: string;
}

export function MemberForm({ mode, member, memberId }: MemberFormProps) {
  const t = useTranslations("memberForm");
  const fields = useTranslations("fields");
  const validation = useTranslations("validation");
  const common = useTranslations("common");
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEdit = mode === "edit";

  const initialValues = useMemo<MemberFormValues>(
    () =>
      member
        ? {
            username: member.username,
            password: "",
            fullName: member.fullName,
            motherName: member.motherName,
            heir: member.heir,
            passportNumber: member.passportNumber,
            birthDate: member.birthDate,
            secretQuestion: member.secretQuestion,
            secretAnswer: "",
            email: member.email,
            pinCode: "",
            phone: member.phone,
            inviter: member.inviter,
            product: member.product,
            address: member.address,
            postalIndex: member.postalIndex,
            officialSite: member.officialSite,
            registrationDate: member.registrationDate,
            amount: String(member.amount),
            currency: member.currency,
            images: savedImages(member),
          }
        : { ...EMPTY_MEMBER_FORM },
    [member],
  );

  const schema = useMemo(() => {
    const required = (field: string) => validation("required", { field });
    const min = (field: string, size: number) => validation("min", { field, min: size });
    const max = (field: string, size: number) => validation("max", { field, max: size });

    const imagesSchema = yup
      .array<UploadImage>()
      .test("required", validation("imageRequired"), (value) => isEdit || (value?.length ?? 0) > 0)
      .test("type", validation("imageType"), (value) =>
        !value?.some((image) => image.file && !image.file.type.startsWith("image/")),
      )
      .test("size", validation("imageSize"), (value) =>
        !value?.some((image) => image.file && image.file.size > 10 * 1024 * 1024),
      );

    return yup.object({
      username: yup.string().required(required(fields("username"))).min(2, min(fields("username"), 2)).max(100, max(fields("username"), 100)),
      password: isEdit
        ? yup.string().test("min", min(fields("password"), 8), (value) => !value || value.length >= 8)
        : yup.string().required(required(fields("password"))).min(8, min(fields("password"), 8)),
      fullName: yup.string().required(required(fields("fullName"))).max(255, max(fields("fullName"), 255)),
      motherName: yup.string().required(required(fields("motherName"))).max(255, max(fields("motherName"), 255)),
      heir: yup.string().required(required(fields("heir"))).max(255, max(fields("heir"), 255)),
      passportNumber: yup.string().required(required(fields("passportNumber"))).min(3, min(fields("passportNumber"), 3)),
      birthDate: yup.string().required(required(fields("birthDate"))).matches(/^\d{4}-\d{2}-\d{2}$/, validation("date")),
      secretQuestion: yup.string().required(required(fields("secretQuestion"))).max(500, max(fields("secretQuestion"), 500)),
      secretAnswer: isEdit
        ? yup.string().test("min", min(fields("secretAnswer"), 2), (value) => !value || value.length >= 2)
        : yup.string().required(required(fields("secretAnswer"))).min(2, min(fields("secretAnswer"), 2)),
      email: yup.string().required(required(fields("email"))).email(validation("email")),
      pinCode: isEdit
        ? yup.string().test("digits", validation("digits", { field: fields("pinCode") }), (value) => !value || /^\d{4,12}$/.test(value))
        : yup.string().required(required(fields("pinCode"))).matches(/^\d{4,12}$/, validation("digits", { field: fields("pinCode") })),
      phone: yup.string().required(required(fields("phone"))).matches(/^\+[1-9]\d{6,14}$/, validation("phone")),
      inviter: yup.string().required(required(fields("inviter"))).max(255, max(fields("inviter"), 255)),
      product: yup.string().required(required(fields("product"))).max(255, max(fields("product"), 255)),
      address: yup.string().required(required(fields("address"))).max(2000, max(fields("address"), 2000)),
      postalIndex: yup.string().required(required(fields("postalIndex"))).max(30, max(fields("postalIndex"), 30)),
      officialSite: yup.string().required(required(fields("officialSite"))).url(validation("url")),
      registrationDate: yup.string().required(required(fields("registrationDate"))).matches(/^\d{4}-\d{2}-\d{2}$/, validation("date")),
      amount: yup
        .string()
        .required(required(fields("amount")))
        .test("numeric", validation("numeric", { field: fields("amount") }), (value) => value !== undefined && value !== "" && !Number.isNaN(Number(value)))
        .test("positive", validation("positive", { field: fields("amount") }), (value) => Number(value) > 0),
      currency: yup.mixed<Currency>().oneOf(["TL", "USD"]).required(required(fields("currency"))),
      images: imagesSchema,
    });
  }, [fields, validation, isEdit]);

  const mutation = useMutation({
    mutationFn: (values: MemberFormValues) =>
      isEdit && memberId ? updateMember(memberId, values) : createMember(values),
    onSuccess: async () => {
      toast.success(isEdit ? t("toasts.updated") : t("toasts.created"));
      await queryClient.invalidateQueries({ queryKey: ["members"] });
      if (memberId) {
        await queryClient.invalidateQueries({ queryKey: ["member", memberId] });
      }
      router.push(ROUTES.members);
      router.refresh();
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, t("toasts.error")));
      const backendErrors = getFieldErrors(error);
      if (backendErrors) {
        formik.setErrors({ ...formik.errors, ...backendErrors });
      }
    },
  });

  const formik = useFormik<MemberFormValues>({
    initialValues,
    validationSchema: schema,
    enableReinitialize: true,
    onSubmit: (values) => mutation.mutate(values),
  });

  const imagesRef = useRef(formik.values.images);
  useEffect(() => {
    imagesRef.current = formik.values.images;
  }, [formik.values.images]);
  useEffect(() => () => revokePreviews(imagesRef.current), []);

  const errorFor = (name: keyof MemberFormValues): string | undefined => {
    const touched = formik.touched[name];
    const error = formik.errors[name];
    return touched && typeof error === "string" ? error : undefined;
  };

  const addImages = (files: File[]): void => {
    formik.setFieldValue("images", [...formik.values.images, ...createUploadImages(files)]);
    formik.setFieldTouched("images", true, false);
  };

  const removeImage = (id: string): void => {
    const image = formik.values.images.find((item) => item.id === id);
    if (image) revokePreview(image);
    formik.setFieldValue("images", formik.values.images.filter((item) => item.id !== id));
  };

  const moveImage = (id: string, direction: -1 | 1): void => {
    const images = [...formik.values.images];
    const index = images.findIndex((image) => image.id === id);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= images.length) return;
    [images[index], images[target]] = [images[target], images[index]];
    formik.setFieldValue("images", images);
  };

  const textField = (
    name: keyof MemberFormValues,
    options: { type?: string; hint?: string; placeholder?: string; autoComplete?: string } = {},
  ) => (
    <Input
      name={name}
      type={options.type ?? "text"}
      label={fields(name)}
      hint={options.hint}
      placeholder={options.placeholder}
      autoComplete={options.autoComplete}
      value={(formik.values[name] as string | number | undefined) ?? ""}
      onChange={formik.handleChange}
      onBlur={formik.handleBlur}
      error={errorFor(name)}
    />
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{isEdit ? t("editTitle") : t("createTitle")}</h1>
          <p className="mt-1 text-sm text-muted">{isEdit ? t("editSubtitle") : t("createSubtitle")}</p>
        </div>
        <button type="button" onClick={() => router.push(ROUTES.members)} className="btn-secondary">
          {common("back")}
        </button>
      </header>

      <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
        <Card title={t("image.title")}>
          <ImageDropzone
            images={formik.values.images}
            error={errorFor("images")}
            onAdd={addImages}
            onRemove={removeImage}
            onMove={moveImage}
          />
        </Card>

        <Card title={t("sections.account")}>
          <div className="grid gap-4 sm:grid-cols-2">
            {textField("username", { autoComplete: "username" })}
            {textField("password", {
              type: "password",
              hint: isEdit ? t("passwordHint") : undefined,
              autoComplete: "new-password",
            })}
          </div>
        </Card>

        <Card title={t("sections.personal")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {textField("fullName")}
            {textField("motherName")}
            {textField("heir")}
            {textField("passportNumber")}
            {textField("birthDate", { type: "date" })}
            {textField("secretQuestion")}
            {textField("secretAnswer", { type: "password", hint: isEdit ? t("secretHint") : undefined })}
          </div>
        </Card>

        <Card title={t("sections.security")}>
          <div className="grid gap-4 sm:grid-cols-2">
            {textField("pinCode", { type: "password", hint: isEdit ? t("pinHint") : undefined })}
            <p className="self-end text-xs text-muted">{t("editSubtitle")}</p>
          </div>
        </Card>

        <Card title={t("sections.contact")}>
          <div className="grid gap-4 sm:grid-cols-2">
            {textField("email", { type: "email", autoComplete: "email" })}
            {textField("phone", { type: "tel", placeholder: "+905551234567" })}
            {textField("inviter")}
            {textField("product")}
            <div className="sm:col-span-2">{textField("address")}</div>
            {textField("postalIndex")}
            {textField("officialSite", { type: "url", placeholder: "https://example.com" })}
          </div>
        </Card>

        <Card title={t("sections.registration")}>
          <div className="grid gap-4 sm:grid-cols-3">
            {textField("registrationDate", { type: "date" })}
            {textField("amount", { type: "number" })}
            <div>
              <Select
                name="currency"
                label={fields("currency")}
                value={formik.values.currency}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={errorFor("currency")}
                options={[
                  { value: "TL", label: "TL" },
                  { value: "USD", label: "USD" },
                ]}
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => router.push(ROUTES.members)} className="btn-secondary">
            {t("cancel")}
          </button>
          <Button type="submit" loading={mutation.isPending} loadingText={t("submitting")}>
            {isEdit ? t("submitSave") : t("submitCreate")}
          </Button>
        </div>
      </form>
    </div>
  );
}
