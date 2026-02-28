"use client";

import React from "react";
import { PlusCircle } from "lucide-react";
import { useModal } from "@/hooks/use-modal";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/common/CustomModal";
import SubAccountDetails from "@/components/forms/subaccount-details";
import { Agency, User } from "@prisma/client";

interface CreateButtonProps {
  user: User & { agency: Agency | null };
  agencyId: string;
}

const CreateButton: React.FC<CreateButtonProps> = ({ user, agencyId }) => {
  const { setOpen } = useModal();
  const agencyDetails = user.agency;

  if (!agencyDetails) return null;

  return (
    <Button
      className="w-full flex gap-2"
      onClick={() => {
        setOpen(
          <CustomModal
            title="Create a Subaccount"
            subTitle="You can switch between your subaccount and agency from the sidebar"
          >
            <SubAccountDetails
              agencyDetails={agencyDetails}
              userId={user.id}
              userName={user.name}
            />
          </CustomModal>
        );
      }}
    >
      <PlusCircle size={15} />
      Create Sub Account
    </Button>
  );
};

export default CreateButton;
