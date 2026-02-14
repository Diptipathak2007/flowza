import { currentUser } from '@clerk/nextjs/server'
import React from 'react'
import { redirect } from 'next/navigation'
import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { Agency, Plan } from '@prisma/client'
import AgencyDetails from '@/components/forms/agency-details'
import { db } from '@/lib/db'

const AgencyPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ plan: Plan; state: string; code: string }>
}) => {
  const authuser = await currentUser()
  if (!authuser) return redirect('/sign-in')

  const user = await getAuthUserDetails()
  const agencyId = await verifyAndAcceptInvitation()
  const params = await searchParams

  if (agencyId) {
    if (user?.role === 'SUBACCOUNT_GUEST' || user?.role === 'SUBACCOUNT_USER') {
      return redirect('/subaccount')
    } else if (user?.role === 'AGENCY_OWNER' || user?.role === 'AGENCY_ADMIN') {
      // ONLY redirect if we have a name, otherwise stay on /agency to finish onboarding
      if (user?.agency?.name) {
        if (params.plan) {
          return redirect(`/agency/${agencyId}/billing?plan=${params.plan}`)
        }
        if (params.state) {
          const [statePath, stateAgencyId] = params.state.split('___');
          if (!stateAgencyId) return <div>Not authorized</div>
          return redirect(
            `/agency/${stateAgencyId}/${statePath}?code=${params.code}`
          )
        }
        return redirect(`/agency/${agencyId}`)
      }
    }
  }

  // Final fallback data for the form
  const agencyData = user?.agency
  const userEmail = authuser?.emailAddresses[0].emailAddress
  
  const defaultData: Partial<Agency> = {
    ...agencyData,
    companyEmail: agencyData?.companyEmail || userEmail || '',
    name: agencyData?.name || user?.name || '',
    agencyLogo: agencyData?.agencyLogo || '',
  }

  return (
    <div className="flex justify-center items-center mt-4">
      <div className="max-w-[850px] border-[1px] p-4 rounded-xl">
        <h1 className="text-4xl text-center mb-4">
          {agencyData?.name ? "Update Agency Information" : "Create An Agency"}
        </h1>
        <AgencyDetails 
          data={defaultData}
        />
      </div>
    </div>
  )
}

export default AgencyPage