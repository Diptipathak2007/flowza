import React from "react";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { getAuthUser, getAgencyDetails } from "@/lib/queries";

import AgencyDetails from "@/components/forms/agency-details";
import UserDetailsForm from "@/components/forms/user-details";
import { constructMetadata } from "@/lib/utils";

export const dynamic = 'force-dynamic'

interface AgencySettingsPageProps {
  params: Promise<{
    agencyId: string;
  }>;
}

const AgencySettingsPage = async ({
  params,
}: AgencySettingsPageProps) => {
  try {
    console.log("--- AGENCY_DEBUG: Page Start ---");
    const { agencyId } = await params;
    const authUser = await currentUser();
    console.log("--- AGENCY_DEBUG: Auth User ---", !!authUser);

    if (!authUser) return redirect("/sign-in");
    if (!agencyId) return redirect("/agency");

    const userDetails = await getAuthUser(
      authUser.emailAddresses[0].emailAddress
    );
    console.log("--- AGENCY_DEBUG: User Details ---", !!userDetails);

    if (!userDetails) return redirect("/sign-in");

    const agencyDetails = await getAgencyDetails(agencyId);
    console.log("--- AGENCY_DEBUG: Agency Details ---", !!agencyDetails);
    
    if (!agencyDetails) return redirect("/agency");
    const subAccounts = agencyDetails.subAccounts || [];
    const updateKey = agencyDetails.updatedAt ? agencyDetails.updatedAt.toString() : "new";

    return (
      <div className="flex flex-col gap-4 max-w-4xl w-full mx-auto">
        <AgencyDetails
          data={agencyDetails}
          key={updateKey}
        />
        <UserDetailsForm
          type="agency"
          id={agencyId}
          subAccounts={subAccounts}
          userData={userDetails}
        />
      </div>
    );
  } catch (error) {
    console.error("--- ERROR in AgencySettingsPage ---", error);
    return (
      <div className="p-4 border border-destructive bg-destructive/10 text-destructive rounded-lg">
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p>There was an error loading the settings page. Please check the server logs.</p>
      </div>
    );
  }
};

export default AgencySettingsPage;

export const metadata = constructMetadata({
  title: "Settings - Plura",
});