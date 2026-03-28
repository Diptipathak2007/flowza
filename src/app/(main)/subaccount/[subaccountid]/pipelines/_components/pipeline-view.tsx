'use client'
import React, { useEffect } from "react"
import { LaneDetail, PipelineDetailsWithLanesCardsTagsTickets } from "@/lib/types"
import { Lane, Ticket } from "@prisma/client"
import { useModal } from "@/providers/modal-provider"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DragDropContext, Droppable, DropResult, DroppableProvided } from "@hello-pangea/dnd"

type Props={
    lanes:LaneDetail[]
    pipelineId:string
    updateTicketsOrder: (tickets:Ticket[])=>Promise<void>
    updateLanesOrder: (lanes:Lane[])=>Promise<void>
    subAccountId:string
    pipelineDetails:PipelineDetailsWithLanesCardsTagsTickets
}

const PipelineView=({
    lanes,
    pipelineId,
    updateTicketsOrder,
    updateLanesOrder,
    subAccountId,
    pipelineDetails,
}:Props)=>{
    const {setOpen}=useModal();
    const router=useRouter();
    const[allLanes,setAllLanes]=useState(lanes);

    useEffect(()=>{
        setAllLanes(lanes);
    },[lanes])

    const onDragEnd = (dropResult: DropResult) => {
        // Implement drag logic
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="bg-white/60 dark:bg-background/60 rounded-xl p-4 use-automation-zoom-in">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl">{pipelineDetails?.name}</h1>
                </div>
                <Droppable droppableId="lanes" type="lane" direction="horizontal">
                    {(provided: DroppableProvided) => (
                        <div
                            className="flex item-center gap-x-2 overflow-scroll"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                        >
                            <div className="flex mt-4">
                                {allLanes.map((lane, index) => (
                                    <div key={lane.id} className="min-w-[300px] border p-4 rounded-lg bg-background/50">
                                        {/* You will implement PipelineLane here */}
                                        {lane.name}
                                    </div>
                                ))}
                                {provided.placeholder}
                            </div>
                        </div>
                    )}
                </Droppable>
            </div>
        </DragDropContext>
    )
}
   

export default PipelineView