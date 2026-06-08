import { z } from 'zod'

export const createGroupSchema = z.object({
    name: z.string()
        .min(2, 'Group name must be at least 2 characters')
        .max(50, 'Group name must be less than 50 characters'),
    description: z.string()
        .max(200, 'Description must be less than 200 characters')
        .optional(),
})

export type CreateGroupFormData = z.infer<typeof createGroupSchema>