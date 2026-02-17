import React from "react";
import { Agency } from "@prisma/client";
import { getAuthUserDetails } from "@/lib/queries";
import MenuOptions from "./menu-options";

type Props={
    id:string;
    type:"agency"|"subaccount";
    
}

const Sidebar = async ({id,type}:Props) => {
    const user = await getAuthUserDetails();
    if (!user || !user.agency) return null;

    const details =
      type === "agency"
        ? user.agency
        : user.agency.subAccounts.find((subaccount) => subaccount.id === id);

    console.log("--- V3.4: Sidebar details.name ---", details?.name);

    if (!details) return null;

    const isWhiteLabel = user.agency.whiteLabel;

    let sideBarLogo = user.agency.agencyLogo || "/assets/flowza-logo.svg";

    if (type === "subaccount") {
      const subaccountDetails = user.agency.subAccounts.find(
        (subaccount) => subaccount.id === id
      );
      if (subaccountDetails) {
        if (!isWhiteLabel && subaccountDetails.subAccountLogo) {
          sideBarLogo = subaccountDetails.subAccountLogo;
        }
      }
    } else if (type === "agency") {
        // Use details directly if it's an agency to be more robust
        sideBarLogo = (details as Agency).agencyLogo || "/assets/flowza-logo.svg";
    }

    // Final check for empty string which might happen if Prisma returns ""
    if (sideBarLogo === "") sideBarLogo = "/assets/flowza-logo.svg";
    const sidebarOpt=type==="agency"?user.agency.sidebarOptions||[]:user.agency.subAccounts.find((subaccount)=>subaccount.id===id)?.sidebarOptions||[]
    const subaccounts=user.agency.subAccounts.filter((subaccount)=>user.permissions.find(permission=>permission.subAccountId===subaccount.id&&permission.access))
    return(
      <>
      <MenuOptions key="desktop-sidebar" defaultOpen={true} subAccount={subaccounts} sideBarOptions={sidebarOpt} sideBarLogo={sideBarLogo} details={details} user={user} id={id} />
      <MenuOptions key="mobile-sidebar" subAccount={subaccounts} sideBarOptions={sidebarOpt} sideBarLogo={sideBarLogo} details={details} user={user} id={id} />
      </>
    )
};

export default Sidebar;