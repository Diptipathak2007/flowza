import React from "react";
import { getAuthUserDetails } from "@/lib/queries";
import { permission } from "process";
import MenuOptions from "./menu-options";

type Props={
    id:string;
    type:"agency"|"subaccount";
    
}

const Sidebar = async ({id,type}:Props) => {
    const user=await getAuthUserDetails();
    if(!user){
        return null;
    }
    if(!user.agency)return
    const details =
      type === 'agency'
        ? user.agency
        : user.agency.subAccounts.find((subaccount) => subaccount.id === id)

    const isWhiteLabel=user.agency.whiteLabel
    if(!details)return;
    let sideBarLogo=user.agency.agencyLogo||"/flowza-logo.png"
    if(isWhiteLabel){
       sideBarLogo=user?.agency.subAccounts.find((subaccount)=>subaccount.id===id)?.subAccountLogo||user.agency.agencyLogo
    }
    const sidebarOpt=type==="agency"?user.agency.sidebarOptions||[]:user.agency.subAccounts.find((subaccount)=>subaccount.id===id)?.sidebarOptions||[]
    const subaccounts=user.agency.subAccounts.filter((subaccount)=>user.permissions.find(permission=>permission.subAccountId===subaccount.id&&permission.access))
    return(
      <>
      <MenuOptions defaultOpen={true  } subaccounts={subaccounts} sidebarOpt={sidebarOpt} sidebarLogo={sideBarLogo} details={details} user={user} id={id} />
      <MenuOptions subaccounts={subaccounts} sidebarOpt={sidebarOpt} sidebarLogo={sideBarLogo} details={details} user={user} id={id} />
      </>
    )
};

export default Sidebar;