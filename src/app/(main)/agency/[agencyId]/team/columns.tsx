"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { type ColumnDef } from "@tanstack/react-table";
import { Role } from "@prisma/client";
import { toast } from "sonner";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";

import { deleteUser, getAuthUser } from "@/queries/auth";

import { useModal } from "@/hooks/use-modal";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import UserDetails from "@/components/forms/user-details";
import CustomModal from "@/components/common/CustomModal";

import { cn } from "@/lib/utils";
import { type UsersWithAgencySubAccountPermissionsSidebarOptions } from "@/lib/types";

export const columns: ColumnDef<UsersWithAgencySubAccountPermissionsSidebarOptions>[] =
  [
    {
      accessorKey: "id",
      header: "",
      cell: () => {
        return null;
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const avatarUrl = row.getValue("avatarUrl") as string;

        return (
          <div className="flex items-center gap-4">
            <div className="h-11 w-11 relative flex-none">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  fill
                  className="rounded-full object-cover"
                  alt="avatar image"
                  sizes="44px"
                />
              ) : (
                <div className="h-full w-full bg-muted rounded-full flex items-center justify-center border border-border">
                  <span className="text-xs text-muted-foreground uppercase">
                    {row.getValue("name") ? (row.getValue("name") as string).slice(0, 2) : "UN"}
                  </span>
                </div>
              )}
            </div>

            <span>{row.getValue("name")}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "avatarUrl",
      header: "",
      cell: () => {
        return null;
      },
    },
    { accessorKey: "email", header: "Email" },
    {
      accessorKey: "subAccounts",
      header: "Owned Accounts",
      cell: ({ row }) => {
        const isAgencyOwner = row.getValue("role") === Role.AGENCY_OWNER;
        const ownedAccounts = row.original?.permissions?.filter(
          (per: any) => per.access
        );

        if (isAgencyOwner) {
          return (
            <div className="flex flex-col items-start">
              <div className="flex flex-col gap-2">
                <Badge className="bg-slate-600 whitespace-nowrap">
                  Agency - {row?.original?.agency?.name}
                </Badge>
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col items-start">
            <div className="flex flex-col gap-2">
              {ownedAccounts?.length ? (
                ownedAccounts.map((account: any) => (
                  <Badge
                    key={account.id}
                    className="bg-slate-600 w-fit whitespace-nowrap"
                  >
                    Sub Account - {account.subAccount.name}
                  </Badge>
                ))
              ) : (
                <div className="text-muted-foreground">No Access Yet</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role: Role = row.getValue("role");
        return (
          <Badge
            className={cn({
              "bg-emerald-500": role === Role.AGENCY_OWNER,
              "bg-orange-400": role === Role.AGENCY_ADMIN,
              "bg-primary": role === Role.SUBACCOUNT_USER,
              "bg-muted": role === Role.SUBACCOUNT_GUEST,
            })}
          >
            {role}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const rowData = row.original;

        return <CellActions rowData={rowData} />;
      },
    },
  ];

interface CellActionsProps {
  rowData: UsersWithAgencySubAccountPermissionsSidebarOptions;
}

const CellActions: React.FC<CellActionsProps> = ({ rowData }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { data, setOpen } = useModal();

  if (!rowData) return null;

  return (
    <AlertDialog>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => navigator.clipboard.writeText(rowData?.email)}
          >
            <Copy size={15} /> Copy Email
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex gap-2"
            onClick={() => {
              setOpen(
                <CustomModal
                  title="Edit User Details"
                  subTitle="You can change permissions only when the user has an owned subaccount"
                >
                  <UserDetails
                    type="agency"
                    id={rowData?.agency?.id || rowData?.agencyId || null}
                    subAccounts={rowData?.agency?.subAccounts || []}
                    userData={rowData}
                  />
                </CustomModal>,

                async () => {
                  return { user: await getAuthUser(rowData?.email) };
                }
              );
            }}
          >

            <Edit className="w-4 h-4" />
            Edit Details
          </DropdownMenuItem>
          {rowData.role !== "AGENCY_OWNER" && (
            <AlertDialogTrigger asChild>
              <DropdownMenuItem className="flex gap-2" onClick={() => {}}>
                <Trash className="w-4 h-4" /> Remove User
              </DropdownMenuItem>
            </AlertDialogTrigger>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-left">
            Are you absolutely sure?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left">
            This action cannot be undone. This will permanently delete the user
            and related data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex items-center">
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive"
            onClick={async () => {
              setIsLoading(true);
              await deleteUser(rowData.id);
              toast.success("Deleted User", {
                description:
                  "The user has been deleted from this agency.",
              });
              setIsLoading(false);
              router.refresh();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};