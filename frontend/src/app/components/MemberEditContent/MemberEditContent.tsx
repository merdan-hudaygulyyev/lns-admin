"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getMember } from "../../api/services/members";
import { Card, Loader } from "../../compLibrary";
import { MemberForm } from "../MemberForm/MemberForm";

export function MemberEditContent({ id }: { id: string }) {
  const errors = useTranslations("errors");
  const details = useTranslations("memberDetails");
  const { data: member, isPending, isError } = useQuery({
    queryKey: ["member", id],
    queryFn: () => getMember(id),
  });

  if (isPending) return <Card><Loader label={details("loading")} /></Card>;
  if (isError || !member) return <Card><p className="text-sm text-danger">{errors("notFound")}</p></Card>;

  return <MemberForm mode="edit" member={member} memberId={id} />;
}
