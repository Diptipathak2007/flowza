import React from 'react'

const AgencyIdPage = async ({
  params,
}: {
  params: Promise<{ agencyId: string }>
}) => {
  const { agencyId } = await params
  return (
    <div>
      {agencyId}
      
    </div>
  )
}

export default AgencyIdPage