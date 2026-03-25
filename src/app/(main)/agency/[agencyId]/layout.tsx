import { getAuthUserDetails, getNotificationAndUser, verifyAndAcceptInvitation } from "@/lib/queries";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
import Unauthorized from "@/components/unauthorized";
import Sidebar from "@/components/sidebar";
import BlurPage from "@/components/global/blur-page";
import Infobar from "@/components/global/infobar";

export const dynamic = 'force-dynamic';

type Props = {
  children: React.ReactNode;
  params: Promise<{ agencyId: string }>;
};

const Layout = async ({ children, params }: Props) => {
  try {
    const agencyId = await verifyAndAcceptInvitation();
    const user = await currentUser();
    if (!user) return redirect("/sign-in");
    if (!agencyId) return redirect("/agency");

    // ALWAYS fetch user from DB to be reactive to role changes (e.g. demotion)
    // Layout-level caching in Next.js will prevent double-fetching within the same request
    const dbUser = await getAuthUserDetails();
    const role = dbUser?.role;

    if (!role || (role !== "AGENCY_OWNER" && role !== "AGENCY_ADMIN")) {
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
          <Infobar notifications={allNoti} role={role as any} />
          <div className="relative h-screen overflow-y-auto">
            <BlurPage>
              {children}
            </BlurPage>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return redirect("/agency");
  }
};

export default Layout;