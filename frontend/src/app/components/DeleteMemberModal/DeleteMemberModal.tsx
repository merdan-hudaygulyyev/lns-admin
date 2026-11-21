"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { deleteMember } from "../../api/services/members";
import { getErrorMessage } from "../../api/axiosInstance";
import { Button, Modal } from "../../compLibrary";
import type { Member } from "../../types";

interface DeleteMemberModalProps {
  member: Member | null;
  onClose: () => void;
  onDeleted?: (id: string) => void;
}

export function DeleteMemberModal({ member, onClose, onDeleted }: DeleteMemberModalProps) {
  const t = useTranslations("members.delete");
  const toasts = useTranslations("members.toasts");
  const common = useTranslations("common");

  const mutation = useMutation({
    mutationFn: (id: string) => deleteMember(id),
    onSuccess: async () => {
      const id = member?.id;
      toast.success(toasts("deleted"));
      onClose();
      if (id) onDeleted?.(id);
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, toasts("deleteFailed")));
    },
  });

  return (
    <Modal
      open={Boolean(member)}
      title={t("title")}
      onClose={onClose}
      disableOutClick={mutation.isPending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            {t("cancel")}
          </Button>
          <Button
            variant="danger"
            loading={mutation.isPending}
            loadingText={t("deleting")}
            onClick={() => member && mutation.mutate(member.id)}
          >
            {t("confirm")}
          </Button>
        </>
      }
    >
      <p>{t("message", { name: member?.fullName ?? common("unknown") })}</p>
    </Modal>
  );
}
