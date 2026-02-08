"use client";
import React from "react";
import { Agency } from "@prisma/client";

type Props = {
  agencyDetails: Agency;
  userId: string;
  userName: string;
};

const SubAccountDetails = ({ agencyDetails, userId, userName }: Props) => {
  return (
    <div>
      <h2 className="text-xl font-bold">Subaccount Details</h2>
      <p className="text-muted-foreground">This is a placeholder for the subaccount details form.</p>
      {/* TODO: Implement the actual form with logic to create subaccounts */}
    </div>
  );
};

export default SubAccountDetails;
