import React from "react";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

type Props = {
    params: Promise<{ subaccountid: string }>
}

const Pipelines = async ({ params }: Props) => {
    const { subaccountid } = await params;

    const pipelineExists = await db.pipeline.findFirst({
        where: { subAccountId: subaccountid },
    })

    if (pipelineExists) {
        return redirect(
            `/subaccount/${subaccountid}/pipelines/${pipelineExists.id}`
        )
    }

    try {
        const response = await db.pipeline.create({
            data: {
                name: 'First Pipeline',
                subAccountId: subaccountid,
            },
        })

        return redirect(
            `/subaccount/${subaccountid}/pipelines/${response.id}`
        )
    } catch (error) {
        console.log(error);
    }

    return <div>Pipelines</div>
}

export default Pipelines