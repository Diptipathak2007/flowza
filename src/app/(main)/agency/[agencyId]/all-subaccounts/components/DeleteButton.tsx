"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteSubAccount, saveActivityLogsNotification } from "@/lib/queries";
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  subAccountId: string;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({ subAccountId }) => {
  const router = useRouter();

  const onDelete = async () => {
    try {
      const response = await deleteSubAccount(subAccountId);
      if (response) {
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Deleted subaccount | ${response.name}`,
          subAccountId: subAccountId,
        });
        toast.success("Subaccount Deleted", {
          description: "Successfully deleted the subaccount.",
        });
        router.refresh();
      }
    } catch (error) {
      toast.error("Oppse!", {
        description: "Could not delete subaccount.",
      });
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={onDelete}
    >
      Delete Subaccount
    </Button>
  );
};

export default DeleteButton;
