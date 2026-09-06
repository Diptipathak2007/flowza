'use client'
import React, { useEffect } from 'react'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card'
import { useForm } from 'react-hook-form'
import { LaneDetail, LaneFormSchema } from '@/lib/types'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  saveActivityLogsNotification,
  upsertLane,
} from '@/lib/queries'
import { toast } from 'sonner'
import { useModal } from '@/hooks/use-modal'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'

interface LaneDetailsProps {
  defaultData?: Partial<LaneDetail>
  pipelineId: string
  subAccountId: string
}

const LaneDetails: React.FC<LaneDetailsProps> = ({
  defaultData,
  pipelineId,
  subAccountId,
}) => {
  const { setClose } = useModal()
  const router = useRouter()

  const form = useForm<z.infer<typeof LaneFormSchema>>({
    mode: 'onChange',
    resolver: zodResolver(LaneFormSchema),
    defaultValues: {
      name: defaultData?.name || '',
      color: defaultData?.color || '#5c40ec',
    },
  })

  useEffect(() => {
    if (defaultData) {
      form.reset({
        name: defaultData.name || '',
        color: defaultData.color || '#5c40ec',
      })
    }
  }, [defaultData, form])

  const isLoading = form.formState.isLoading || form.formState.isSubmitting

  const onSubmit = async (values: z.infer<typeof LaneFormSchema>) => {
    try {
      const response = await upsertLane({
        ...values,
        id: defaultData?.id,
        pipelineId: pipelineId,
        order: defaultData?.order,
      })

      await saveActivityLogsNotification({
        agencyId: undefined,
        description: `Updated a lane | ${response?.name}`,
        subAccountId: subAccountId,
      })

      toast.success('Saved lane details')
      router.refresh()
      setClose()
    } catch (error) {
      toast.error('Oops!', {
        description: 'Could not save lane details',
      })
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Lane Details</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FormField
              disabled={isLoading}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lane Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Lane Name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={isLoading}
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lane Color</FormLabel>
                  <FormControl>
                    <Input
                      type="color"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              className="w-20 mt-4"
              disabled={isLoading}
              type="submit"
            >
              {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

export default LaneDetails
