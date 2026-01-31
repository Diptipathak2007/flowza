import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import { redirect } from 'next/navigation'
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { Plan } from '@prisma/client'
import AgencyDetails from '@/components/forms/agency-details'

const AgencyPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ plan: Plan; state: string; code: string }>
}) => {
  const authuser = await currentUser()
  if (!authuser) return redirect('/sign-in')

  const agencyId = await verifyAndAcceptInvitation()
  console.log(agencyId)

  const user = await getAuthUserDetails()
  if (agencyId) {
    if (user?.role === 'SUBACCOUNT_GUEST' || user?.role === 'SUBACCOUNT_USER') {
      return redirect('/subaccount')
    } else if (user?.role === 'AGENCY_OWNER' || user?.role === 'AGENCY_ADMIN') {
      const params = await searchParams
      if (params.plan) {
        return redirect(`/agency/${agencyId}/billing?plan=${params.plan}`)
      }
      if (params.state) {
        const [statePath, stateAgencyId] = params.state.split('___');
        if (!stateAgencyId) return <div>Not authorized</div>
        return redirect(
          `/agency/${stateAgencyId}/${statePath}?code=${params.code}`
        )
      } else return redirect(`/agency/${agencyId}`)
    } else {
      return redirect('/agency')
    }
  }
  const params = await searchParams
  
  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl"> Create An Agency</h1>
        <AgencyDetails 
        data={{companyEmail:authuser?.emailAddresses[0].emailAddress}}
        />

      </div>
    </div>
  )
}

export default AgencyPage