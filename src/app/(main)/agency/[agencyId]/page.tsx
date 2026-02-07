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
      <p>hello this is your agency dashboard</p>
    </div>
  )
}

export default AgencyIdPage