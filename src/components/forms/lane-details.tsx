'use client'
import React from 'react'
import { LaneDetail } from '@/lib/types'

type Props = {
  pipelineId: string
  defaultData?: Partial<LaneDetail>
}

const LaneDetails = ({ pipelineId, defaultData }: Props) => {
  return (
    <div>LaneDetails Form for {pipelineId}</div>
  )
}

export default LaneDetails
