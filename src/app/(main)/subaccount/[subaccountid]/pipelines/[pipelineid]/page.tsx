import React from "react";
import { getLanesWithTicketsAndTags, getPipelineDetails } from "@/lib/queries";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { LaneDetail } from "@/lib/types";
import { Tabs, TabsList } from "@/components/ui/tabs";
import PipelineInfobar from "../_components/pipeline-infobar";

type Props = {
    params: Promise<{ subaccountid: string, pipelineid: string }>
}

const PipelinePage = async ({ params }: Props) => {
    const { subaccountid, pipelineid } = await params;

    const pipelineDetails=await getPipelineDetails(pipelineid)
    if(!pipelineDetails)return redirect(`/subaccount/${subaccountid}/pipelines`)
    const pipelines=await db.pipeline.findMany({
        where:{
            subAccountId: subaccountid
        }
    })
    const lanes=(await getLanesWithTicketsAndTags(
        pipelineid
    ))as LaneDetail[]
    return (
        <Tabs defaultValue="view" className="w-full">
            <TabsList className="bg-transparent border-b-2 h-16 w-full justify-between mb-4">
                <PipelineInfobar
                    pipelineId={pipelineid}
                    subAccountId={subaccountid}
                    pipelines={pipelines}
                />
            </TabsList>
        </Tabs>
    )
}

export default PipelinePage