import { useState, type SyntheticEvent } from 'react'

import api from '@/api/axios'
import { Modal } from '@/components/Modal/Modal'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { Label } from '@/components/ui/Label/Label'
import type { GroupMember } from '@/types'

interface AddMemberModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    groupId: string
    onMemberAdded: (member: GroupMember) => void
}

function AddMemberModal({
    open,
    onOpenChange,
    groupId,
    onMemberAdded,
}: AddMemberModalProps) {
    const [email, setEmail] = useState('')
    const [emailError, setEmailError] = useState<string | null>(null)
    const [serverError, setServerError] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const resetForm = () => {
        setEmail('')
        setEmailError(null)
        setServerError(null)
    }

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            resetForm()
        }

        onOpenChange(nextOpen)
    }

    const handleSubmit = async (
        event: SyntheticEvent<HTMLFormElement>,
    ) => {
        event.preventDefault()
        setEmailError(null)
        setServerError(null)

        if (!email) {
            setEmailError('Email is required')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address')
            return
        }

        setIsSubmitting(true)

        try {
            const response = await api.post<{ data: GroupMember }>(
                `/groups/${groupId}/members`,
                { email },
            )

            onMemberAdded(response.data.data)
            handleOpenChange(false)
        } catch (error: unknown) {
            if (
                error &&
                typeof error === 'object' &&
                'response' in error
            ) {
                const axiosError = error as {
                    response?: {
                        data?: {
                            message?: string
                        }
                    }
                }

                setServerError(
                    axiosError.response?.data?.message ??
                        'Something went wrong',
                )
            } else {
                setServerError('Something went wrong')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Modal
            open={open}
            onOpenChange={handleOpenChange}
            title="Add Member"
            description="Add an existing user to this group using their email address."
        >
            {serverError && (
                <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
                    {serverError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="member-email">
                        Email Address
                    </Label>

                    <Input
                        id="member-email"
                        name="email"
                        type="email"
                        placeholder="friend@example.com"
                        value={email}
                        onChange={(event) => {
                            setEmail(event.target.value)
                            setEmailError(null)
                        }}
                        aria-invalid={Boolean(emailError)}
                        aria-describedby={
                            emailError
                                ? 'member-email-error'
                                : undefined
                        }
                    />

                    {emailError && (
                        <p
                            id="member-email-error"
                            className="mt-1 text-xs text-red-500"
                        >
                            {emailError}
                        </p>
                    )}
                </div>

                <div className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => handleOpenChange(false)}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>

                    <Button
                        type="submit"
                        className="flex-1"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Adding...' : 'Add Member'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

export { AddMemberModal }