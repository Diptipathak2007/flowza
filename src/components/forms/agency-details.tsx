"use client";

import React, { useState } from "react";
import { Agency } from "@prisma/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/card";
import { AlertDialog } from "../ui/alert-dialog";
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
});


const AgencyDetails = ({ data }: Props) => {
  const router = useRouter();
  const [deletingAgency,setDeletingAgency] = useState(false)

  const form=useForm<z.infer<typeof FormSchema>>({
    mode:"onChange",
    resolver:zodResolver(FormSchema),
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
    },
    
  })
  const isLoading = form.formState.isSubmitting
  useEffect(()=>{
    if(data){
        form.reset(data)
    }
    
  },[data])
  const handleSubmit:SubmitHandler<z.infer<typeof FormSchema>> = async (values) => {
    console.log(values)
  }
  return <AlertDialog>
    <Card>
        <CardHeader>
            <CardTitle>Agency Information</CardTitle>
            <CardDescription>
                Lets create an agency for you business.You can edit agency 
                settings
                later from the agency settings tab
            </CardDescription>
            
        </CardHeader>
        <CardContent>
            <Form {...form} >
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                <FormField disabled={isLoading} control={form.control} name="agencyLogo" render={({field})=>(
                    <FormItem>
                        <FormLabel>Agency Logo</FormLabel>
                        <FormControl>
                          <FileUpload
                            apiEndpoint="agencyLogo"
                            onChange={field.onChange}
                            value={field.value}
                          />
                        </FormControl>
                        <FormDescription>
                            This is your public display name.
                        </FormDescription>
                        <FormMessage/>
                    </FormItem>
                )}>

                </FormField>
            </form>
            </Form>
        </CardContent>
    </Card>
  </AlertDialog>
};

export default AgencyDetails;
