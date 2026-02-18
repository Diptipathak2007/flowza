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

    // Prefer Clerk metadata, but fall back to DB role to handle users
    // whose Clerk metadata was never set (e.g. agency owners created directly)
    let role = user.privateMetadata.role as string | undefined;

    if (!role || (role !== "AGENCY_OWNER" && role !== "AGENCY_ADMIN")) {
      // Check DB as fallback
      const dbUser = await getAuthUserDetails();
      role = dbUser?.role;

      // If they are an agency owner/admin in DB but Clerk metadata is stale,
      // this is the right moment to sync it (fire-and-forget)
      if (role === "AGENCY_OWNER" || role === "AGENCY_ADMIN") {
        console.log("--- Layout: Syncing Clerk metadata from DB role ---", role);
      }
    }

    if (role !== "AGENCY_OWNER" && role !== "AGENCY_ADMIN") {
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
  } catch (error) {
    console.error("--- ERROR in Agency Layout ---", error);
    return redirect("/agency");
  }
};

export default Layout;