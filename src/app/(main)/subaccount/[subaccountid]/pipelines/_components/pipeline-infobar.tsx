"use client";

import React from 'react'
import { Pipeline } from '@prisma/client'

type Props = {
    pipelineId: string
    subAccountId: string
    pipelines: Pipeline[]
}

const PipelineInfobar = ({ pipelineId, subAccountId, pipelines }: Props) => {
  
  return (
    <div>
        <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">Pipeline:</span>
            <span className="font-semibold">{pipelines.find(p => p.id === pipelineId)?.name || 'Unknown'}</span>
        </div>
    </div>
  )
}

export default PipelineInfobar
