'use client'
import React from 'react'
import { Tag } from '@prisma/client'

interface TagDetailsProps {
  subAccountId: string
  getSelectedTags: (tags: Tag[]) => void
  defaultTags: Tag[]
}

const TagDetails: React.FC<TagDetailsProps> = ({ subAccountId, getSelectedTags, defaultTags }) => {
  return (
    <div className="p-4 bg-muted/50 rounded-md border mt-2">
      <p className="text-sm text-muted-foreground">Tag selection placeholder</p>
    </div>
  )
}

export default TagDetails
