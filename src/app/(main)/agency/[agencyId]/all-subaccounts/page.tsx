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
import EditSubAccountButton from "./components/EditSubAccountButton";
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
                    className="h-auto bg-card/50 my-4 text-primary border border-border/50 p-6 cursor-pointer rounded-2xl flex items-center justify-between hover:bg-card transition-all duration-300 group shadow-lg hover:shadow-primary/5"
                  >
                    <Link
                      href={`/subaccount/${subAccount.id}`}
                      className="flex gap-6 w-full h-full items-center"
                    >
                      <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-xl border border-border/50 bg-muted/20">
                        {subAccount.subAccountLogo ? (
                          <Image
                            src={subAccount.subAccountLogo}
                            alt="Subaccount logo"
                            fill
                            sizes="(max-width: 768px) 100vw, 80px"
                            className="object-contain p-2"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10">
                            <PlusCircle className="w-6 h-6 text-primary/40 mb-1" />
                            <span className="text-[10px] font-bold text-primary/40 uppercase tracking-tighter">No Logo</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center gap-1">
                        <div className="flex flex-col">
                          <span className="font-bold text-lg tracking-tight group-hover:text-primary transition-colors">
                            {subAccount.name || 'Untitled Account'}
                          </span>
                          <span className="text-muted-foreground text-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            {subAccount.address || 'No location set'}
                          </span>
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-3">
                      {user.agency && (
                        <EditSubAccountButton
                          subAccount={subAccount}
                          agencyDetails={user.agency as any}
                          user={user as any}
                        />
                      )}
                      <AlertDialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all rounded-lg h-10 px-4"
                        >
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                    </div>
                    
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-left">
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-left">
                          This action cannot be undone. This will permanently
                          delete the subaccount and all data related to this
                          subaccount.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex items-center">
                        <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
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