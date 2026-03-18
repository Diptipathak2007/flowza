import React from 'react'
import { db } from '@/lib/db'
import DataTable from './data-tables'
import { columns } from './columns'
import { currentUser } from '@clerk/nextjs/server'
import SendInvitation from '@/components/forms/send-invitation'

type Props = {
  params: Promise<{ agencyId: string }>
}

const TeamPage = async (props: Props) => {
  const params = await props.params
  const authUser = await currentUser()
  if (!authUser) return null

  const teamMembers = await db.user.findMany({
    where: {
      agency: {
        id: params.agencyId,
      },
    },
    include: {
      agency: { include: { subAccounts: true } },
      permissions: { include: { subAccount: true } },
    },
  })

  const agencyDetails = await db.agency.findUnique({


    where: {
      id: params.agencyId,
    },
    include: {
      subAccounts: true,
    },
  })

  if (!agencyDetails) return null

  return (
    <DataTable
      actionButtonText="Add Team Member"
      modalChildren={<SendInvitation agencyId={params.agencyId} />}
      filterValue="name"
      columns={columns}
      data={teamMembers}
    />
  )
}

export default TeamPage