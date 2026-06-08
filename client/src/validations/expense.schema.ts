import { z } from 'zod'

export const createExpenseSchema = z.object({
    description: z.string()
        .min(1, 'Description is required')
        .max(100, 'Description must be less than 100 characters'),
    amount: z.number({ invalid_type_error: 'Amount must be a number' })
        .positive('Amount must be greater than 0')
        .multipleOf(0.01, 'Amount can have at most 2 decimal places'),
    splitBetween: z.array(z.string().uuid())
        .min(1, 'Select at least one person to split with'),
})

export type CreateExpenseFormData = z.infer<typeof createExpenseSchema>
