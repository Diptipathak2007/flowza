'use client'
import React from 'react'

type Props = {
  pipelineId: string
}

const LaneDetails = ({ pipelineId }: Props) => {
  return (
    <div>LaneDetails Form for {pipelineId}</div>
  )
}

export default LaneDetails
