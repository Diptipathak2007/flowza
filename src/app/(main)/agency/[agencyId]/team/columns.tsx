'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Agency, AgencySidebarOption, Permissions, Prisma, Role, SubAccount, User } from '@prisma/client'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import Image from 'next/image'

export type UsersWithAgencySubAccountPermissions = Prisma.UserGetPayload<{
  include: {
    agency: { include: { subAccounts: true } }
    permissions: { include: { subAccount: true } }
  }
}>

export const columns: ColumnDef<UsersWithAgencySubAccountPermissions>[] = [
  {
    accessorKey: 'id',
    header: '',
    cell: () => null,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
      const avatarUrl = row.getValue('avatarUrl') as string
      return (
        <div className="flex items-center gap-4">
          <div className="h-11 w-11 relative flex-shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                fill
                className="rounded-full object-cover"
                alt="avatar"
              />
            ) : (
                <div className="h-full w-full bg-muted rounded-full flex items-center justify-center">
                    {row.original.name.charAt(0)}
                </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-bold">{row.original.name}</span>
            <span className="text-muted-foreground">{row.original.email}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: 'avatarUrl',
    header: '',
    cell: () => null,
  },
  {
    accessorKey: 'subAccounts',
    header: 'Owned Accounts',
    cell: ({ row }) => {
      const permissions = row.original.permissions
      return (
        <div className="flex flex-col items-start gap-2">
          {permissions.length > 0 ? (
            permissions.map((per) => (
              <Badge
                key={per.id}
                variant="secondary"
                className="bg-slate-900 border-none text-white whitespace-nowrap"
              >
                {per.subAccount.name}
              </Badge>
            ))
          ) : (
            <div className="text-muted-foreground">No Access</div>
          )}
        </div>
      )
    },
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.getValue('role') as Role
      return (
        <Badge
          className={cn('capitalize', {
            'bg-emerald-500': role === 'AGENCY_OWNER',
            'bg-orange-400': role === 'AGENCY_ADMIN',
            'bg-primary': role === 'SUBACCOUNT_USER',
            'bg-muted': role === 'SUBACCOUNT_GUEST',
          })}
        >
          {role.replace('_', ' ')}
        </Badge>
      )
    },
  },
]
