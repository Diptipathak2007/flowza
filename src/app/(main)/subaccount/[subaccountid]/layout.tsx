import React from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Role } from "@prisma/client";

import { 
  verifyAndAcceptInvitation as verifyInvitation, 
  getAuthUserDetails, 
  getNotificationAndUser as getNotification 
} from "@/lib/queries";

import Sidebar from "@/components/sidebar";
import InfoBar from "@/components/global/infobar";

import { NotificationsWithUser } from "@/lib/types";

interface SubAccountIdLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    subaccountid: string | undefined;
  }>;
}

const SubAccountIdLayout: React.FC<SubAccountIdLayoutProps> = async ({
  children,
  params,
}) => {
  const { subaccountid } = await params;
  const agencyId = await verifyInvitation();

  if (!subaccountid) redirect(`/subaccount/unauthorized`);
  if (!agencyId) redirect(`/subaccount/unauthorized`);

  const user = await currentUser();

  if (!user) redirect(`/agency/sign-in`);

  let notifications: NotificationsWithUser = [];

  if (!user.privateMetadata.role) {
    redirect(`/subaccount/unauthorized`);
  }

  const authUser = await getAuthUserDetails();

  // Agency owners and admins have implicit access to all subaccounts
  const isAgencyLevel =
    user.privateMetadata.role === Role.AGENCY_OWNER ||
    user.privateMetadata.role === Role.AGENCY_ADMIN;

  if (!isAgencyLevel) {
    const hasPermission = authUser?.permissions.find(
      (permission: any) =>
        permission.access && permission.subAccountId === subaccountid
    );
    if (!hasPermission) redirect(`/subaccount/unauthorized`);
  }

  const allNotifications = await getNotification(agencyId);

  if (
    user.privateMetadata.role === Role.AGENCY_ADMIN ||
    user.privateMetadata.role === Role.AGENCY_OWNER
  ) {
    notifications = allNotifications || [];
  } else {
    const filteredNotifications = allNotifications?.filter(
      (notification: any) => notification.subAccountId === subaccountid
    );
    if (filteredNotifications) notifications = filteredNotifications;
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={subaccountid} type="subaccount" />

      <div className="md:pl-[300px]">
        <InfoBar
          notifications={notifications}
          role={user.privateMetadata.role as Role}
          subAccountId={subaccountid}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
};

export default SubAccountIdLayout;