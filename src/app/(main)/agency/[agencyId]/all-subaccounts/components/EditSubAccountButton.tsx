"use client";

import React from "react";
import { Settings2 } from "lucide-react";
import { useModal } from "@/hooks/use-modal";
import { Button } from "@/components/ui/button";
import CustomModal from "@/components/global/custom-modal";
import SubAccountDetails from "@/components/forms/subaccount-details";
import { Agency, SubAccount, User } from "@prisma/client";

interface EditSubAccountButtonProps {
  subAccount: SubAccount;
  agencyDetails: Agency;
  user: User;
}

const EditSubAccountButton: React.FC<EditSubAccountButtonProps> = ({ 
  subAccount, 
  agencyDetails,
  user
}) => {
  const { setOpen } = useModal();

  return (
    <Button
      size="sm"
      variant="ghost"
      className="text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all rounded-lg h-10 px-4 flex items-center gap-2"
      onClick={() => {
        setOpen(
          <CustomModal
            title="Edit Subaccount Details"
            subTitle="Modify the information for this subaccount"
          >
            <SubAccountDetails
              agencyDetails={agencyDetails}
              details={subAccount}
              userId={user.id}
              userName={user.name}
            />
          </CustomModal>
        );
      }}
    >
      <Settings2 className="w-4 h-4" />
      <span className="hidden sm:inline">Settings</span>
    </Button>
  );
};

export default EditSubAccountButton;
