'use client'
import React from 'react'
import { TicketAndTags, LaneDetail } from '@/lib/types'

type Props = {
  setAllTickets: (tickets: TicketAndTags[]) => void
  allTickets: TicketAndTags[]
  tickets: TicketAndTags[]
  pipelineId: string
  laneDetails: LaneDetail
  subAccountId: string
  index: number
}

const PipelineLane = ({
  laneDetails,
}: Props) => {
  return (
    <div className="min-w-[300px] border p-4 rounded-lg bg-background/50">
      {laneDetails.name}
    </div>
  )
}

export default PipelineLane
