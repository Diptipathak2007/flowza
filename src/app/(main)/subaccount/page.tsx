import { getAuthUserDetails, verifyAndAcceptInvitation } from '@/lib/queries'
import { redirect } from 'next/navigation'
import React from 'react'
import Unauthorized from '@/components/unauthorized'

const SubAccountPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ state: string; code: string }>
}) => {
  const agencyId = await verifyAndAcceptInvitation()
  console.log("--- SUBACCOUNT PAGE DEBUG ---", { agencyId });

  if (!agencyId) {
    console.log("--- SUBACCOUNT PAGE: NO AGENCY ID ---");
    return redirect('/sign-in')
  }

  const user = await getAuthUserDetails()
  if (!user) {
    console.log("--- SUBACCOUNT PAGE: NO USER ---");
    return redirect('/sign-in')
  }

  // Auto-fix for Agency Owner if they are stuck with SUBACCOUNT_USER role
  // This helps when they've accepted an invitation that downgraded their role
  const isActuallyOwner = user.agency?.companyEmail === user.email
  const role = isActuallyOwner ? 'AGENCY_OWNER' : user.role

  console.log("--- SUBACCOUNT PAGE: USER INFO ---", { 
    email: user.email, 
    role, 
    actualRoleInDB: user.role,
    permissions: user.permissions?.length 
  });

  if (role === 'AGENCY_OWNER' || role === 'AGENCY_ADMIN') {
    if (user.agency?.subAccounts[0]) {
      return redirect(`/subaccount/${user.agency.subAccounts[0].id}`)
    } else {
      return redirect(`/agency/${agencyId}`)
    }
  }

  const getFirstSubaccountWithAccess = user.permissions.find(
    (permission) => permission.access === true
  )


  const params = await searchParams

  if (params.state) {
    const statePath = params.state.split('___')[0]
    const stateSubaccountId = params.state.split('___')[1]
    if (!stateSubaccountId) return <div>Not Authorized</div>
    return redirect(
      `/subaccount/${stateSubaccountId}/${statePath}?code=${params.code}`
    )
  }

  if (user.role === 'AGENCY_OWNER' || user.role === 'AGENCY_ADMIN') {
    if (user.agency?.subAccounts[0]) {
      return redirect(`/subaccount/${user.agency.subAccounts[0].id}`)
    } else {
      return redirect(`/agency/${agencyId}`)
    }
  }


  if (getFirstSubaccountWithAccess) {
    return redirect(`/subaccount/${getFirstSubaccountWithAccess.subAccountId}`)
  }


  return <Unauthorized />
}

export default SubAccountPage
