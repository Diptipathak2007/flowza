import React from 'react'

const AgencyIdPage =async ({params}: {params: {agencyId: string}}) => {
  return (
    <div>
        {params.agencyId}
        <p>
          hello this is your agency dashboard
          
        </p>
    </div>
  )
}

export default AgencyIdPage