import React from "react";
import { getLanesWithTicketsAndTags, getPipelineDetails, updateLanesOrder, updateTicketsOrder } from "@/lib/queries";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { LaneDetail } from "@/lib/types";
import { Tabs, TabsList,TabsTrigger,TabsContent } from "@/components/ui/tabs";
import PipelineInfobar from "../_components/pipeline-infobar";
import PipelineSettings from "../_components/pipeline-settings";
import PipelineView from "../_components/pipeline-view";

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
                <div>
                    <TabsTrigger
                    value="view"
                    className="!bg-transparent w-48"
                    >
                        Pipeline View
                    </TabsTrigger>
                    <TabsTrigger
                    value="settings"
                    className="!bg-transparent w-48"
                    >
                        Settings
                    </TabsTrigger>
                </div>
            </TabsList>
            <TabsContent value="view">
                <PipelineView
                lanes={lanes}
                pipelineId={pipelineid}
                updateTicketsOrder={updateTicketsOrder}
                updateLanesOrder={updateLanesOrder}
                subAccountId={subaccountid}
                pipelineDetails={pipelineDetails}
                />
            </TabsContent>
            <TabsContent value="settings">
                <PipelineSettings
                    pipelineId={pipelineid}
                    subAccountId={subaccountid}
                    pipelines={pipelines}
                />
            </TabsContent>
        </Tabs>
    )
}

export default PipelinePage