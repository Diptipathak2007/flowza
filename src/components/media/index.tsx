"use client"
import React from 'react'
import { Media as MediaFile, Prisma } from '@prisma/client'
import MediaUploadButton from './MediaUploadButton'
import { Input } from '../ui/input'
import MediaCard from './MediaCard'

type Props = {
  data: Prisma.SubAccountGetPayload<{
    include: { media: true }
  }> | null
  subAccountId: string
}

const Media = ({ data, subAccountId }: Props) => {
  const [search, setSearch] = React.useState('')

  const filteredMedia = data?.media.filter((file) =>
    file.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-4 h-full w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl">Media Bucket</h1>
        <MediaUploadButton subaccountId={subAccountId} />
      </div>
      
      <Input
        placeholder="Search for file name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="flex flex-wrap gap-4 pt-4 pb-40 overflow-y-auto">
        {filteredMedia?.map((file) => (
          <div
            key={file.id}
            className="max-w-[300px] w-full rounded-lg"
          >
            <MediaCard file={file} />
          </div>
        ))}
        {!filteredMedia?.length && (
          <div className="flex items-center justify-center w-full ">
            <p className="text-muted-foreground ">Empty! no files to show.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Media
