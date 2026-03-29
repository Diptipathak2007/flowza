import { z } from 'zod'

export const TicketDetailsValidator = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  value: z.string().refine((value) => !isNaN(Number(value)), {
    message: 'Value must be a valid number',
  }),
})

export type TicketDetailsSchema = z.infer<typeof TicketDetailsValidator>
