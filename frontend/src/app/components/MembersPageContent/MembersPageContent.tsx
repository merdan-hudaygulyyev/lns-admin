"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertCircle, ChevronLeft, ChevronRight, Plus, Search, SearchX, SlidersHorizontal } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { getMembers } from "../../api/services/members";
import { Button, Select } from "../../compLibrary";
import { useDebounce } from "../../hooks/useDebounce";
import { Link } from "../../../i18n/navigation";
import type { Member, MemberListParams } from "../../types";
import { ROUTES } from "../../utils/routes";
import { DeleteMemberModal } from "../DeleteMemberModal/DeleteMemberModal";
import { EMPTY_FILTERS, MemberFilters, type FilterValues } from "../MemberFilters/MemberFilters";
import { MembersTable } from "../MembersTable/MembersTable";

const PAGE_SIZES = [10, 20, 50];

export function MembersPageContent() {
  const t = useTranslations("members");
  const common = useTranslations("common");

  const [searchInput, setSearchInput] = useState("");
  const search = useDebounce(searchInput, 400);
  const [filters, setFilters] = useState<FilterValues>(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<NonNullable<MemberListParams["sortBy"]>>("created_at");
  const [order, setOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  const params = useMemo<MemberListParams>(
    () => ({ page, limit, search: search || undefined, sortBy, order, ...filters }),
    [page, limit, search, sortBy, order, filters],
  );

  const membersQuery = useQuery({
    queryKey: ["members", params],
    queryFn: () => getMembers(params),
  });

  const members = membersQuery.data?.data ?? [];
  const meta = membersQuery.data?.meta;

  const applyFilters = (next: FilterValues) => {
    setFilters(next);
    setPage(1);
  };

  const resetFilters = () => {
    setFilters(EMPTY_FILTERS);
    setSearchInput("");
    setPage(1);
  };

  const showingFrom = meta && meta.total > 0 ? (meta.page - 1) * meta.limit + 1 : 0;
  const showingTo = meta ? Math.min(meta.page * meta.limit, meta.total) : 0;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted">{t("subtitle")}</p>
        </div>
        <Link href={ROUTES.memberNew} className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {t("add")}
        </Link>
      </header>

      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(1);
              }}
              placeholder={t("searchPlaceholder")}
              aria-label={common("search")}
              className="input pl-10"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="btn-secondary"
            aria-expanded={showFilters}
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
            {showFilters ? t("hideFilters") : t("showFilters")}
          </button>

          <div className="w-40">
            <Select
              name="sortBy"
              aria-label={t("sortBy")}
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as typeof sortBy);
                setPage(1);
              }}
              options={[
                { value: "created_at", label: t("sort.created_at") },
                { value: "full_name", label: t("sort.full_name") },
                { value: "amount", label: t("sort.amount") },
                { value: "registration_date", label: t("sort.registration_date") },
              ]}
            />
          </div>
          <div className="w-32">
            <Select
              name="order"
              aria-label={t("sortBy")}
              value={order}
              onChange={(event) => {
                setOrder(event.target.value as "asc" | "desc");
                setPage(1);
              }}
              options={[
                { value: "desc", label: t("sort.desc") },
                { value: "asc", label: t("sort.asc") },
              ]}
            />
          </div>
        </div>

        {showFilters && (
          <MemberFilters value={filters} onChange={applyFilters} onReset={resetFilters} />
        )}
      </div>

      <div className="card overflow-hidden">
        {membersQuery.isPending ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="skeleton h-10 w-10 rounded-lg" />
                <div className="skeleton h-4 flex-1" />
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-4 w-24" />
              </div>
            ))}
          </div>
        ) : membersQuery.isError ? (
          <div className="p-10 text-center">
            <AlertCircle className="mx-auto h-9 w-9 text-danger" aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold text-ink">{t("error.title")}</h2>
            <p className="mt-1 text-sm text-muted">{t("error.description")}</p>
            <Button variant="secondary" className="mx-auto mt-5" onClick={() => membersQuery.refetch()}>
              {common("retry")}
            </Button>
          </div>
        ) : members.length === 0 ? (
          <div className="p-10 text-center">
            <SearchX className="mx-auto h-9 w-9 text-muted" aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold text-ink">{t("empty.title")}</h2>
            <p className="mt-1 text-sm text-muted">{t("empty.description")}</p>
            <button type="button" onClick={resetFilters} className="mt-5 text-sm text-brand hover:underline">
              {t("resetFilters")}
            </button>
          </div>
        ) : (
          <>
            <MembersTable members={members} onDelete={setMemberToDelete} />
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 text-xs text-muted">
              <span>
                {t("pagination.showing", {
                  from: showingFrom,
                  to: showingTo,
                  total: meta?.total ?? 0,
                })}
              </span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  {t("pagination.rowsPerPage")}
                  <select
                    value={limit}
                    onChange={(event) => {
                      setLimit(Number(event.target.value));
                      setPage(1);
                    }}
                    className="input w-16 !py-1.5"
                    aria-label={t("pagination.rowsPerPage")}
                  >
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>
                <span>
                  {t("pagination.pageOf", {
                    page: meta?.page ?? page,
                    total: meta?.totalPages ?? 1,
                  })}
                </span>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.max(1, value - 1))}
                    disabled={page <= 1}
                    className="rounded-md border border-line p-1.5 hover:bg-surface-2 disabled:opacity-40"
                    aria-label={common("back")}
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((value) => Math.min(meta?.totalPages ?? value, value + 1))}
                    disabled={!meta || page >= meta.totalPages}
                    className="rounded-md border border-line p-1.5 hover:bg-surface-2 disabled:opacity-40"
                    aria-label={common("retry")}
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <DeleteMemberModal
        member={memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onDeleted={() => membersQuery.refetch()}
      />
    </div>
  );
}
