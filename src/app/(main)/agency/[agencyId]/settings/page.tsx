import AgencyDetails from '@/components/forms/agency-details'
import { getAuthUserDetails } from '@/lib/queries'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  params: Promise<{ agencyId: string }>
}

const SettingsPage = async ({ params }: Props) => {
  const authUser = await getAuthUserDetails()
  if (!authUser) return null

  const { agencyId } = await params
  const agencyDetails = authUser.agency

  if (!agencyDetails || agencyDetails.id !== agencyId) return redirect('/agency')

  return (
    <div className="flex lg:flex-row flex-col gap-4 p-4">
      <AgencyDetails data={agencyDetails} key={agencyDetails.updatedAt.toString()} />
    </div>
  )
}

export default SettingsPage
