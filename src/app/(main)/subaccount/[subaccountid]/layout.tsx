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
  params: {
    subaccountId: string | undefined;
  };
}

const SubAccountIdLayout: React.FC<SubAccountIdLayoutProps> = async ({
  children,
  params,
}) => {
  const { subaccountId } = params;
  const agencyId = await verifyInvitation();

  if (!subaccountId) redirect(`/subaccount/unauthorized`);
  if (!agencyId) redirect(`/subaccount/unauthorized`);

  const user = await currentUser();

  if (!user) redirect(`/agency/sign-in`);

  let notifications: NotificationsWithUser = [];

  if (!user.privateMetadata.role) {
    redirect(`/subaccount/unauthorized`);
  }

  const authUser = await getAuthUserDetails();
  const hasPermission = authUser?.permissions.find(
    (permission: any) =>
      permission.access && permission.subAccountId === subaccountId
  );
  if (!hasPermission) redirect(`/subaccount/unauthorized`);

  const allNotifications = await getNotification(agencyId);

  if (
    user.privateMetadata.role === Role.AGENCY_ADMIN ||
    user.privateMetadata.role === Role.AGENCY_OWNER
  ) {
    notifications = allNotifications || [];
  } else {
    const filteredNotifications = allNotifications?.filter(
      (notification: any) => notification.subAccountId === subaccountId
    );
    if (filteredNotifications) notifications = filteredNotifications;
  }

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={subaccountId} type="subaccount" />

      <div className="md:pl-[300px]">
        <InfoBar
          notifications={notifications}
          role={user.privateMetadata.role as Role}
          subAccountId={params.subaccountId as string}
        />
        <div className="relative">{children}</div>
      </div>
    </div>
  );
};

export default SubAccountIdLayout;