import React from "react";
import { getPipelineDetails } from "@/lib/queries";
type Props = {
    params:{ subaccountId: string, pipelineId: string }
}

const PipelinePage = async ({ params }: Props) => {
    const pipelineDetails=await getPipelineDetails(params.pipelineId)
    return (
        <div>PipelinePage</div>
    )
}

export default PipelinePage