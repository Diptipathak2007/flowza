import { getNotificationAndUser, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import Unauthorized from "@/components/unauthorized";
import Sidebar from "@/components/sidebar";
import BlurPage from "@/components/global/blur-page";
import Infobar from "@/components/global/infobar";

type Props = {
  children: React.ReactNode;
  params: Promise<{ agencyId: string }>;
};

const Layout = async ({ children, params }: Props) => {
  const agencyId = await verifyAndAcceptInvitation();
  const user = await currentUser();
  if (!user) return redirect("/sign-in");
  if (!agencyId) return redirect("/agency");

  if (
    user.privateMetadata.role !== "AGENCY_OWNER" &&
    user.privateMetadata.role !== "AGENCY_ADMIN"
  ) {
    return <Unauthorized />;
  }

  let allNoti: any = [];
  const notifications = await getNotificationAndUser(agencyId);
  if (notifications) allNoti = notifications;

  const { agencyId: resolvedAgencyId } = await params;

  return (
    <div className="h-screen overflow-hidden">
      <Sidebar id={resolvedAgencyId} type="agency" />
      <div className="md:pl-[300px]">
        <Infobar notifications={allNoti}/>
        <div className="relative h-screen overflow-y-auto">
          <BlurPage>
            {children}
          </BlurPage>
        </div>
      </div>
    </div>
  );
};

export default Layout;