import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { PlusCircle } from "lucide-react";

import { getAuthUserDetails } from "@/lib/queries";
import { SubAccount } from "@prisma/client";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import DeleteButton from "./components/DeleteButton";
import CreateButton from "./components/CreateButton";
import { constructMetadata } from "@/lib/utils";

interface AllSubAccountsPageProps {
  params: Promise<{
    agencyId: string | undefined;
  }>;
}

const AllSubAccountsPage: React.FC<AllSubAccountsPageProps> = async ({
  params,
}) => {
  const { agencyId } = await params;

  const user = await getAuthUserDetails();

  if (!agencyId) redirect("/agency/unauthorized");
  if (!user) redirect("/agency/sign-in");

  return (
    <AlertDialog>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex justify-center md:justify-start">
          <CreateButton user={user as any} agencyId={agencyId} />
        </div>
        <Command className="bg-transparent border border-border rounded-xl">
          <CommandInput placeholder="Search accounts..." />
          <CommandList className="max-h-[600px]">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Sub Accounts">
              {!!user.agency?.subAccounts.length ? (
                user.agency.subAccounts.map((subAccount: SubAccount) => (
                  <CommandItem
                    key={subAccount.id}
                    className="h-32 bg-background my-2 text-primary border border-border p-4 cursor-pointer rounded-xl flex items-center justify-between"
                  >
                    <Link
                      href={`/subaccount/${subAccount.id}`}
                      className="flex gap-4 w-full h-full"
                    >
                      <div className="relative w-28 h-28">
                        <Image
                          src={subAccount.subAccountLogo}
                          alt="Subaccount logo"
                          fill
                          className="rounded-md object-contain bg-muted/50 p-4"
                        />
                      </div>
                      <div className="flex flex-col justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold">{subAccount.name}</span>
                          <span className="text-muted-foreground text-xs">
                            {subAccount.address}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive" className="w-20">
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-left">
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete the subaccount and all data related to
                          subaccount.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex items-center">
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <DeleteButton subAccountId={subAccount.id} />
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </CommandItem>
                ))
              ) : (
                <div className="text-muted-foreground text-center p-4">
                  No subaccounts
                </div>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
    </AlertDialog>
  );
};

export default AllSubAccountsPage;

export const metadata = constructMetadata({
  title: "Subaccounts - Plura",
});