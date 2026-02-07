"use client";

import React, { useState } from "react";
import { Agency, Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import {
  updateAgencyDetails,
  saveActivityLogsNotification,
  deleteAgency,
  initUser,
  upsertAgency,
} from "@/lib/queries";
import { NumberInput } from "@tremor/react";
import { v4 as uuidv4 } from "uuid";
import { MinOptions } from "date-fns";

const ReloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    {...props}
  >
    <path d="M21 12a9 9 0 1 1-3.36-6.36" />
    <polyline points="21 3 21 9 15 9" />
  </svg>
);
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../ui/card";
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
} from "../ui/alert-dialog";
import { Input } from "../ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { SubmitHandler, useForm } from "react-hook-form";
import FileUpload from "../global/file-upload";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Switch } from "../ui/switch";
import { Button } from "../ui/button";
import { min } from "date-fns";
import { shadcn } from "@clerk/themes";
import { Alert } from "../ui/alert";

type Props = {
  data?: Partial<Agency>;
};

const FormSchema = z.object({
  name: z.string().min(2, { message: "Agency name must be at least 2 chars." }),
  companyEmail: z.string().email({ message: "Invalid email." }),
  companyPhone: z.string().min(1, { message: "Phone number is required." }),
  whiteLabel: z.boolean(),
  address: z.string().min(1, { message: "Address is required." }),
  city: z.string().min(1, { message: "City is required." }),
  zipCode: z.string().min(1, { message: "Zip code is required." }),
  state: z.string().min(1, { message: "State is required." }),
  country: z.string().min(1, { message: "Country is required." }),
  agencyLogo: z.string().min(1, { message: "Agency logo is required." }),
  goal: z.number().min(1),
});

const AgencyDetails = ({ data }: Props) => {
  const router = useRouter();
  const [deletingAgency, setDeletingAgency] = useState(false);

  const form = useForm<z.infer<typeof FormSchema>>({
    mode: "onChange",
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: data?.name || "",
      companyEmail: data?.companyEmail || "",
      companyPhone: data?.companyPhone || "",
      whiteLabel: data?.whiteLabel || false,
      address: data?.address || "",
      city: data?.city || "",
      zipCode: data?.zipCode || "",
      state: data?.state || "",
      country: data?.country || "",
      agencyLogo: data?.agencyLogo || "",
      goal: data?.goal || 5,
    },
  });
  const isLoading = form.formState.isSubmitting;
  useEffect(() => {
    if (data && data.id) {
      form.reset(data);
    }
  }, [data]);

  const handleDeleteAgency = async () => {
    if (!data?.id) return;
    setDeletingAgency(true);
    // TODO: implement deleteAgency
    try {
      const response = await deleteAgency(data.id);
      toast.success("Deleted Agency");
      router.refresh();
      router.push("/agency");
    } catch (error) {
      console.log(error);
      toast.error("Could not delete your agency");
    }
    setDeletingAgency(false);
  };
  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    try {
      await initUser({ role: Role.AGENCY_OWNER });

      const response = await upsertAgency({
        id: data?.id ? data.id : uuidv4(),
        address: values.address,
        agencyLogo: values.agencyLogo,
        city: values.city,
        companyPhone: values.companyPhone,
        country: values.country,
        name: values.name,
        state: values.state,
        whiteLabel: values.whiteLabel,
        zipCode: values.zipCode,
        createdAt: new Date(),
        updatedAt: new Date(),
        companyEmail: values.companyEmail,
        connectAccountId: "",
        goal: values.goal,
      } as Agency);

      if (data?.id) {
        if (form.formState.isDirty) {
          toast.success("Updated Agency Details");
          router.refresh();
        } else {
          // If not dirty, it means user clicked "Save Agency Information" to proceed
          router.push(`/agency/${data.id}`);
        }
      } else if (response) {
        toast.success("Created Agency");
        router.push(`/agency/${response.id}`);
        router.refresh();
      }
    } catch (error) {
      console.error(error);
      toast.error("Ooppsie!", {
        description: "Could not create your agency. Please try again.",
      });
    }
  };

  return (
    <AlertDialog>
      <Card>
        <CardHeader>
          <CardTitle>Agency Information</CardTitle>
          <CardDescription>
            Lets create an agency for you business.You can edit agency settings
            later from the agency settings tab
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                disabled={isLoading}
                control={form.control}
                name="agencyLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Logo</FormLabel>
                    <FormControl>
                      <FileUpload
                        apiEndpoint="agencyLogo"
                        onChange={field.onChange}
                        value={field.value}
                      />
                    </FormControl>

                    <FormMessage />
                  </FormItem>
                )}
              ></FormField>
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Agency Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="companyEmail"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Agency Email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="companyPhone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Agency Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your agency phone number"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                disabled={isLoading}
                control={form.control}
                name="whiteLabel"
                render={({ field }) => {
                  return (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border gap-4 p-4">
                      <div>
                        <FormLabel>White Label Agency</FormLabel>
                        <FormDescription>
                          Turning on &quot;White Label&quot; mode will show your
                          agency logo to all sub-accounts by default. You can
                          overwrite this functionality through sub account
                          settings.
                        </FormDescription>
                      </div>

                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  );
                }}
              />
              <FormField
                disabled={isLoading}
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="20 Cooper Square" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex md:flex-row gap-4">
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="City" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="State" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  disabled={isLoading}
                  control={form.control}
                  name="zipCode"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Zip Code</FormLabel>
                      <FormControl>
                        <Input placeholder="Zip Code" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                disabled={isLoading}
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="goal"
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    <FormLabel>Create A Goal</FormLabel>
                    <FormDescription>
                      ✨ Create a goal for your agency. As your business grows
                      your goals grow too so dont forget to set the bar higher!
                    </FormDescription>
                    <NumberInput
                      defaultValue={field.value}
                      onValueChange={async (value: number) => {
                        field.onChange(value);
                        if (data?.id) {
                          await updateAgencyDetails(data.id, { goal: value });
                          await saveActivityLogsNotification({
                            agencyId: data.id,
                            description: `Updated the agency goal to | ${value} Sub Account`,
                          });
                          router.refresh();
                        }
                      }}
                      min={1}
                      placeholder="Sub Account Goal"
                      className="bg-background! border! border-input!"
                    />
                  </div>
                )}
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full mt-4"
              >
                <ReloadIcon
                  className={isLoading ? "animate-spin mr-2" : "mr-2"}
                />
                {data?.id ? (
                  form.formState.isDirty ? "Update Agency Information" : "Save Agency Information"
                ) : (
                  "Create Agency"
                )}
              </Button>
            </form>
          </Form>
          {data?.id && (
            <>
              <div className="flex flex-row items-center justify-between rounded-lg border border-destructive gap-4 p-4 mt-4">
                <div>
                  <div>Danger Zone</div>
                </div>
                <div className="text-muted-foreground">
                  Deleting Your agency cannot be undone.This will also delete
                  all subaccounts and all data related to your
                  subaccounts.Subaccounts will no longer have access to
                  funnnels,contacts etc.
                </div>
              </div>
              <AlertDialogTrigger
                disabled={isLoading || deletingAgency}
                asChild
              >
                <div className="flex justify-end w-full mt-4">
                  <Button
                    variant="destructive"
                    disabled={isLoading || deletingAgency}
                  >
                    Delete Agency
                  </Button>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-left">
                    Are you absolutely sure?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-left">
                    This action cannot be undone. This will permanently delete
                    the Agency account and all related sub accounts.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex items-center">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={deletingAgency}
                    className="bg-destructive hover:bg-destructive"
                    onClick={handleDeleteAgency}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </>
          )}
        </CardContent>
      </Card>
    </AlertDialog>
  );
};

export default AgencyDetails;
