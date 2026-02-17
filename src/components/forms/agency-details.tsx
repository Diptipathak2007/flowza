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
} from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
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
import FileUpload from "@/components/global/file-upload";
import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { shadcn } from "@clerk/themes";
import { Alert } from "@/components/ui/alert";

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
  const [loading, setLoading] = useState(false);

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
    if (data && !form.formState.isDirty) {
      form.reset(data);
    }
  }, [data, form.formState.isDirty, form]);

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
    console.log("--- VERSION 3.5 handleSubmit TRIGGERED ---");
    // ALWAYS use getValues to ensure we have the full state even if one field triggered the submit
    const currentValues = form.getValues();
    console.log("--- VERSION 3.5 Values ---", JSON.stringify(currentValues));
    
    try {
      setLoading(true);
      
      const payload = {
        id: data?.id || uuidv4(),
        name: currentValues.name,
        agencyLogo: currentValues.agencyLogo,
        companyEmail: currentValues.companyEmail,
        companyPhone: currentValues.companyPhone,
        whiteLabel: currentValues.whiteLabel,
        address: currentValues.address,
        city: currentValues.city,
        zipCode: currentValues.zipCode,
        state: currentValues.state,
        country: currentValues.country,
        goal: currentValues.goal,
        connectAccountId: data?.connectAccountId || "",
        createdAt: data?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      console.log("--- FINAL PAYLOAD to upsertAgency (V3.5) ---", payload);
      
      const response = await upsertAgency(payload);
      console.log("--- upsertAgency RESPONSE ---", response);

      if (data?.id) {
        toast.success("Agency details updated (V3.5)");
        form.reset(payload);
        router.refresh();
      } else {
        toast.success("Agency created (V3.5)");
      }

      const finalId = data?.id || response?.id;
      if (finalId) {
        router.refresh();
        router.push(`/agency/${finalId}`);
      }
    } catch (error) {
      console.error(error);
      toast.error("Ooppsie!", {
        description: "Could not save your agency details. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <Card className="w-full bg-[#09090b] border-2 border-primary/20 shadow-[-10px_-10px_30px_4px_rgba(0,0,0,0.1),_10px_10px_30px_4px_rgba(45,212,191,0.05)] overflow-hidden">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-primary rounded-full" />
            <CardTitle className="text-2xl font-bold tracking-tight">Agency Information (V3.5)</CardTitle>
          </div>
          <CardDescription className="text-muted-foreground/80">
            Design your agency identity. These settings can be modified anytime.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
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
                disabled={loading || isLoading}
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all active:scale-[0.98]"
              >
                {loading || isLoading ? (
                  <ReloadIcon className="animate-spin mr-2 h-4 w-4" />
                ) : (
                  <ReloadIcon className="mr-2 h-4 w-4" />
                )}
                {data?.id ? "Save Agency Information" : "Create Agency"}
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
