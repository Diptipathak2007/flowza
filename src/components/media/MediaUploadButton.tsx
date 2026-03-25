"use client"
import React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../ui/button'
import CustomModal from '../global/custom-modal'
import UploadMediaForm from '../forms/upload-media'
import { useModal } from '@/hooks/use-modal'

type Props = {
  subaccountId: string
}

const MediaUploadButton = ({ subaccountId }: Props) => {
  const { setOpen } = useModal()

  return (
    <Button
      onClick={() => {
        setOpen(
          <CustomModal
            title="Upload Media"
            subTitle="Upload a file to your media bucket"
          >
            <UploadMediaForm subaccountId={subaccountId} />
          </CustomModal>
        )
      }}
    >
      Upload
    </Button>
  )
}

export default MediaUploadButton
