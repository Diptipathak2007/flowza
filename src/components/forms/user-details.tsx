"use client";

import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Role, type SubAccount, type User } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

import {
  getAuthUserDetails,
  updateUser,
  changeUserPermissions,
  getUserWithPermissionsAndSubAccount,
  saveActivityLogsNotification
} from "@/lib/queries";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import FileUpload from "../global/file-upload";

import { useModal } from "@/hooks/use-modal";
import {
  type AuthUserWithAgencySidebarOptionsAndSubAccounts,
  type UserWithPermissionsAndSubAccounts,
} from "@/lib/types";
import { z } from "zod";

const UserDataValidator = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  avatarUrl: z.string().optional().or(z.null()),
  role: z.nativeEnum(Role),
});



type UserDataSchema = z.infer<typeof UserDataValidator>;

interface UserDetailsProps {
  id: string | null;
  type: "agency" | "subaccount";
  userData?: Partial<User>;
  subAccounts?: SubAccount[];
}

const UserDetailsForm: React.FC<UserDetailsProps> = ({
  id,
  type,
  subAccounts,
  userData,
}) => {
  const router = useRouter();
  const { data: modalData, setClose } = useModal() as { 
    data: { user?: User }; 
    isOpen: boolean; 
    setOpen: any; 
    setClose: any 
  };

  const [roleState, setRoleState] = React.useState<string>("");
  const [isPermissionLoading, setIsPermissionLoading] =
    React.useState<boolean>(false);
  const [subAccountPermissions, setSubAccountPermissions] =
    React.useState<UserWithPermissionsAndSubAccounts | null>(null);
  const [authUserData, setAuthUserData] =
    React.useState<AuthUserWithAgencySidebarOptionsAndSubAccounts | null>(null);

  const form = useForm<UserDataSchema>({
    resolver: zodResolver(UserDataValidator),
    mode: "onChange",
    defaultValues: {
      name: userData?.name || modalData?.user?.name || "",
      email: userData?.email || modalData?.user?.email || "",
      avatarUrl: userData?.avatarUrl || modalData?.user?.avatarUrl || "",
      role: userData?.role || modalData?.user?.role || Role.SUBACCOUNT_USER,
    },
  });

  React.useEffect(() => {
    const fetchDetails = async () => {
      const response = await getAuthUserDetails();
      if (response) setAuthUserData(response);
    };
    fetchDetails();
  }, [modalData]);

  React.useEffect(() => {
    const getPermissions = async () => {
      if (modalData.user) {
        const permissions = await getUserWithPermissionsAndSubAccount(modalData.user.id);
        if (permissions) setSubAccountPermissions(permissions);
      }
    };
    getPermissions();
  }, [modalData]);

  const hasResetRef = React.useRef(false);

  React.useEffect(() => {
    const targetData = userData || modalData?.user;
    if (targetData && !hasResetRef.current) {
      form.reset({
        name: targetData.name || "",
        email: targetData.email || "",
        avatarUrl: targetData.avatarUrl || "",
        role: targetData.role || Role.SUBACCOUNT_USER,
      });
      hasResetRef.current = true;
    }
  }, [userData, modalData?.user, form]);


  const onSubmit: SubmitHandler<UserDataSchema> = async (values) => {
    const userId = userData?.id || modalData?.user?.id;
    if (!userId) {
      toast.error("Error", {
        description: "Could not find user ID to update.",
      });
      return;
    }
    
    console.log("--- [CLIENT DEBUG] UserDetails submitting:", JSON.stringify(values, null, 2));
    
    try {
      const response = await updateUser({
        ...values,
        avatarUrl: values.avatarUrl || "",
        id: userId,
      });

      if (response) {
        toast.success("Success", {
          description: "Updated User Information",
        });
        setClose();
        router.refresh();
      } else {
        toast.error("Error", {
          description: "Could not update user information",
        });
      }
    } catch (error) {
      console.error("--- [CLIENT DEBUG] Submission Error:", error);
      toast.error("Error", {
        description: "An unexpected error occurred",
      });
    }
  };

  const onChangePermission = async (
    subAccountId: string,
    access: boolean,
    permissionId: string | undefined
  ) => {
    if (!modalData.user?.email) return null;

    setIsPermissionLoading(true);

    const response = await changeUserPermissions(
      permissionId ? permissionId : uuidv4(),
      modalData.user?.email,
      subAccountId,
      access
    );

    if (type === "agency") {
      const subAccountWithPermission = subAccountPermissions?.permissions?.find(
        (permission: any) => permission.subAccountId === subAccountId
      )?.subAccount;

      await saveActivityLogsNotification({
        agencyId: authUserData?.agency?.id,
        description: `Gave ${userData?.name} access to | ${subAccountWithPermission?.name}`,
        subAccountId: subAccountWithPermission?.id,
      });
    }

    if (response) {
      toast.success("Success", {
        description: "The request was successfull",
      });

      if (subAccountPermissions) {
        setSubAccountPermissions((prev) => {
          if (!prev) return prev;
          const permissionExists = prev.permissions.find(
            (p) => p.subAccountId === subAccountId
          );

          if (permissionExists) {
            return {
              ...prev,
              permissions: prev.permissions.map((p) => {
                if (p.subAccountId === subAccountId) {
                  return { ...p, access: access };
                }
                return p;
              }),
            };
          } else {
            const subAccount = subAccounts?.find((s) => s.id === subAccountId);
            if (subAccount) {
              return {
                ...prev,
                permissions: [
                  ...prev.permissions,
                  { ...response, subAccount: subAccount },
                ],
              };
            }
            return prev;
          }
        });
      }
    } else {
      toast.error("Failed", {
        description: "Could not update permission",
      });
    }

    router.refresh();
    setIsPermissionLoading(false);
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card className="w-full bg-card border border-border shadow-2xl overflow-hidden">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>Add or update your information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile picture</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="avatar"
                      value={field.value || ""}

                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User full name</FormLabel>
                  <FormControl>
                    <Input placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={
                        userData?.role === Role.AGENCY_OWNER || isSubmitting
                      }
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>User role</FormLabel>
                  <Select
                    disabled={field.value === Role.AGENCY_OWNER}
                    onValueChange={(value) => {
                      if (
                        value === Role.SUBACCOUNT_USER ||
                        value === Role.SUBACCOUNT_GUEST
                      ) {
                        setRoleState(
                          "You need to have subaccounts to assing Subaccount access to team member."
                        );
                      } else {
                        setRoleState("");
                      }

                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={Role.AGENCY_ADMIN}>
                        Agency Admin
                      </SelectItem>
                      {(modalData?.user?.role === Role.AGENCY_OWNER ||
                        userData?.role === Role.AGENCY_OWNER) && (
                        <SelectItem value={Role.AGENCY_OWNER}>
                          Agency Owner
                        </SelectItem>
                      )}
                      <SelectItem value={Role.SUBACCOUNT_USER}>
                        Sub Account User
                      </SelectItem>
                      <SelectItem value={Role.SUBACCOUNT_GUEST}>
                        Sub Account Guest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="flex justify-end w-full">
              <Button
                disabled={isSubmitting}
                isLoading={isSubmitting}
                type="submit"
              >
                Save User Details
              </Button>
            </div>

            {authUserData?.role === Role.AGENCY_OWNER && (
              <div>
                <Separator className="mb-4" />
                <FormLabel>User permissions</FormLabel>
                <FormDescription className="mb-4">
                  You can give Sub Account access to team member by turning on
                  access control for each Sub Account. This is only visible to
                  agency owners.
                </FormDescription>
                <div className="flex flex-col gap-4">
                  {subAccounts?.map((subAccount) => {
                    const subAccountPermissionsDetails =
                      subAccountPermissions?.permissions.find(
                        (permission: any) =>
                          permission.subAccountId === subAccount.id
                      );

                    return (
                      <div
                        key={subAccount.id}
                        className="flex items-center justify-between rounded-md border p-4"
                      >
                        <div className="">
                          <p>{subAccount.name}</p>
                        </div>
                        <Switch
                          disabled={isPermissionLoading}
                          checked={!!subAccountPermissionsDetails?.access}
                          onCheckedChange={(access) => {
                            onChangePermission(
                              subAccount.id,
                              access,
                              subAccountPermissionsDetails?.id
                            );
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserDetailsForm;