import React from "react";
import { getAuthUserDetails } from "@/lib/queries";

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
    
  return <div>Sidebar</div>;
};

export default Sidebar;