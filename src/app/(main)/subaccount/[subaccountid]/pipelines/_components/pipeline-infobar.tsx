"use client";

import React from 'react'
import { Pipeline } from '@prisma/client'
import { useModal } from '@/providers/modal-provider';
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';
import CustomModal from '@/components/common/CustomModal';
import CreatePipelineForm from '@/components/forms/create-pipeline-form';

type Props = {
    pipelineId: string
    subAccountId: string
    pipelines: Pipeline[]
}

const PipelineInfobar = ({ pipelineId, subAccountId, pipelines }: Props) => {
  const {setOpen:setOpenModal,setClose}=useModal();
  const [open,setOpen]=useState(false);
  const [value,setValue]=useState(pipelineId);
  const handleClickCreatePipeline=()=>{
    setOpenModal(
      <CustomModal
      title="Create Pipeline"
      subTitle="Pipelines allows you to group tickets into lanes and track your business processes all in one place"
      >
       <CreatePipelineForm subAccountId={subAccountId}/>
      </CustomModal>
    )
  }

  return (
    <div>
        <div className="flex items-center gap-2">
           <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className='w-[200px] justify-between'>
                  {value
                  ?pipelines.find((pipeline)=>pipeline.id===value)?.name
                  :"Select a pipeline"}
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50'/>
                </Button>
            </PopoverTrigger>
            <PopoverContent>
                
            </PopoverContent>
           </Popover>
        </div>
    </div>
  )
}

export default PipelineInfobar
