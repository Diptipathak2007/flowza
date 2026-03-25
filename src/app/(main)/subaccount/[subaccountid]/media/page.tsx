import React from "react";
import { redirect } from "next/navigation";

import { getMedia } from "@/lib/queries";

import BlurPage from "@/components/global/blur-page";
import Media from "@/components/media";
import { constructMetadata } from "@/lib/utils";

interface MediaPageProps {
  params: Promise<{
    subaccountid: string | undefined;
  }>;
}

const MediaPage: React.FC<MediaPageProps> = async ({ params }) => {
  const { subaccountid } = await params;

  if (!subaccountid) redirect(`/subaccount/unauthorized`);

  const media = await getMedia(subaccountid);

  return (
    <BlurPage>
      <Media data={media} subAccountId={subaccountid} />
    </BlurPage>
  );
};

export default MediaPage;

export const metadata = constructMetadata({
  title: "Media - Plura",
});