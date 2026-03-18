"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Role } from "@prisma/client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { sendInvitation } from "@/lib/queries";

const InvitationSchema = z.object({
  email: z.string().email(),
  role: z.nativeEnum(Role),
});

interface SendInvitationProps {
  agencyId: string;
}

const SendInvitation: React.FC<SendInvitationProps> = ({ agencyId }) => {
  const form = useForm<z.infer<typeof InvitationSchema>>({
    resolver: zodResolver(InvitationSchema),
    defaultValues: {
      email: "",
      role: Role.SUBACCOUNT_USER,
    },
  });

  const onSubmit = async (values: z.infer<typeof InvitationSchema>) => {
    const currentValues = form.getValues();
    try {

      const res = await sendInvitation({
        role: currentValues.role,
        email: currentValues.email,
        agencyId,
      });





      if (res) {
        toast.success("Success", {
          description: "Invitation sent",
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Oppse!", {
        description: "Could not send invitation",
      });
    }
  };

  const isSubmitting = form.formState.isSubmitting;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitation</CardTitle>
        <CardDescription>
          Send an invitation to a team member to join your agency. Note that
          this will also send an email invitation from Clerk.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            <FormField
              disabled={isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User role</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value)}
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
                      <SelectItem value={Role.SUBACCOUNT_USER}>
                        Sub Account User
                      </SelectItem>
                      <SelectItem value={Role.SUBACCOUNT_GUEST}>
                        Sub Account Guest
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              disabled={isSubmitting}
              type="submit"
            >
              Send Invitation
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default SendInvitation;
