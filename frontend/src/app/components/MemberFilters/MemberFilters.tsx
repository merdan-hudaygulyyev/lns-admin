"use client";

import { useTranslations } from "next-intl";
import { Input, Select } from "../../compLibrary";
import type { MemberListParams } from "../../types";

export type FilterValues = Pick<
  MemberListParams,
  | "currency"
  | "product"
  | "inviter"
  | "amountMin"
  | "amountMax"
  | "registrationFrom"
  | "registrationTo"
  | "birthFrom"
  | "birthTo"
>;

interface MemberFiltersProps {
  value: FilterValues;
  onChange: (next: FilterValues) => void;
  onReset: () => void;
}

export function MemberFilters({ value, onChange, onReset }: MemberFiltersProps) {
  const t = useTranslations("members.filters");
  const membersT = useTranslations("members");
  const fields = useTranslations("fields");
  const common = useTranslations("common");

  const set = (key: keyof FilterValues, fieldValue: string) => {
    onChange({ ...value, [key]: fieldValue });
  };

  return (
    <div className="card mt-4 animate-fade-in p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">
          {membersT("filtersTitle")}
        </h3>
        <button type="button" onClick={onReset} className="text-xs text-brand hover:underline">
          {membersT("resetFilters")}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <Select
          label={t("currency")}
          name="currency"
          value={value.currency ?? ""}
          onChange={(event) => set("currency", event.target.value)}
          options={[
            { value: "", label: t("allCurrencies") },
            { value: "TL", label: "TL" },
            { value: "USD", label: "USD" },
          ]}
        />
        <Input
          label={t("product")}
          name="product"
          value={value.product ?? ""}
          onChange={(event) => set("product", event.target.value)}
        />
        <Input
          label={t("inviter")}
          name="inviter"
          value={value.inviter ?? ""}
          onChange={(event) => set("inviter", event.target.value)}
        />
        <Input
          label={t("amountMin")}
          name="amountMin"
          type="number"
          min="0"
          step="0.01"
          value={value.amountMin ?? ""}
          onChange={(event) => set("amountMin", event.target.value)}
        />
        <Input
          label={t("amountMax")}
          name="amountMax"
          type="number"
          min="0"
          step="0.01"
          value={value.amountMax ?? ""}
          onChange={(event) => set("amountMax", event.target.value)}
        />
        <Input
          label={t("registrationFrom")}
          name="registrationFrom"
          type="date"
          value={value.registrationFrom ?? ""}
          onChange={(event) => set("registrationFrom", event.target.value)}
        />
        <Input
          label={t("registrationTo")}
          name="registrationTo"
          type="date"
          value={value.registrationTo ?? ""}
          onChange={(event) => set("registrationTo", event.target.value)}
        />
        <Input
          label={t("birthFrom")}
          name="birthFrom"
          type="date"
          value={value.birthFrom ?? ""}
          onChange={(event) => set("birthFrom", event.target.value)}
        />
        <Input
          label={t("birthTo")}
          name="birthTo"
          type="date"
          value={value.birthTo ?? ""}
          onChange={(event) => set("birthTo", event.target.value)}
        />
        <p className="self-end text-xs text-muted sm:col-span-2 lg:col-span-3 xl:col-span-4">
          {fields("amount")} · {common("currency")}
        </p>
      </div>
    </div>
  );
}

export const EMPTY_FILTERS: FilterValues = {
  currency: "",
  product: "",
  inviter: "",
  amountMin: "",
  amountMax: "",
  registrationFrom: "",
  registrationTo: "",
  birthFrom: "",
  birthTo: "",
};

