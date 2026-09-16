import { useState, type SyntheticEvent } from 'react';
import api from '@/api/axios';
import { Modal } from '@/components/Modal/Modal';
import { Button } from '@/components/ui/Button/Button';
import { Input } from '@/components/ui/Input/Input';
import { Label } from '@/components/ui/Label/Label';
import { createExpenseSchema } from '@/validations/expense.schema';
import type { Expense, GroupMember, User } from '@/types';

interface AddExpenseModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    groupId: string
    members: GroupMember[]
    currentUser: User | null
    onExpenseAdded: (expense: Expense) => void
};

function AddExpenseModal({
    open,
    onOpenChange,
    groupId,
    members,
    currentUser,
    onExpenseAdded,
}: AddExpenseModalProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<string[]>(() => members.map((member) => member.userId));
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [serverError, setServerError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const resetForm = () => {
        setDescription('')
        setAmount('')
        setSelectedMembers([])
        setFieldErrors({})
        setServerError(null)
    }

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) resetForm();
        onOpenChange(nextOpen)
    }

    const toggleMemberSelection = (userId: string) => {
        setSelectedMembers((currentMembers) =>
            currentMembers.includes(userId)
                ? currentMembers.filter(
                    (memberId) => memberId !== userId,
                )
                : [...currentMembers, userId],
        );
        setFieldErrors((currentErrors) => ({
            ...currentErrors,
            splitBetween: '',
        }));
    }

    const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault()
        setServerError(null)
        setFieldErrors({})
        const parsedAmount = Number.parseFloat(amount)

        const result = createExpenseSchema.safeParse({
            description,
            amount: Number.isNaN(parsedAmount)
                ? undefined
                : parsedAmount,
            splitBetween: selectedMembers,
        });

        if (!result.success) {
            const validationErrors: Record<string, string> = {}
            result.error.errors.forEach((error) => {
                const field = error.path[0]?.toString()
                if (field && !validationErrors[field]) validationErrors[field] = error.message
            });
            setFieldErrors(validationErrors);
            return;
        }
        setIsSubmitting(true);

        try {
            const response = await api.post<{ data: Expense }>(`/groups/${groupId}/expenses`, result.data);
            onExpenseAdded(response.data.data);
            handleOpenChange(false);
        } catch (error: unknown) {
            if (error && typeof error === 'object' && 'response' in error) {
                const axiosError = error as {
                    response?: {
                        data?: {
                            message?: string
                        }
                    }
                };
                setServerError(axiosError.response?.data?.message ?? 'Something went wrong');
            } else {
                setServerError('Something went wrong');
            }
        } finally {
            setIsSubmitting(false);
        }
    }

    const parsedAmount = Number.parseFloat(amount)

    const splitPreview =
        selectedMembers.length > 0 &&
        amount &&
        !Number.isNaN(parsedAmount)
            ? (parsedAmount / selectedMembers.length).toFixed(2)
            : null

    return (
        <Modal open={open} onOpenChange={handleOpenChange} title="Add Expense" description="Record an expense and choose which group members should share it.">
            {serverError && (<div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{serverError}</div>)}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="expense-description">Description</Label>
                    <Input id="expense-description" name="description" placeholder="Dinner, Uber, Groceries..." value={description}
                        onChange={(event) => {
                            setDescription(event.target.value)
                            setFieldErrors((currentErrors) => ({
                                ...currentErrors,
                                description: '',
                            }))
                        }}
                        aria-invalid={Boolean(fieldErrors.description)}
                        aria-describedby={fieldErrors.description ? 'expense-description-error' : undefined}
                    />
                    {fieldErrors.description && (<p id="expense-description-error" className="mt-1 text-xs text-red-500">{fieldErrors.description}</p>)}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="expense-amount">Amount (₹)</Label>
                    <Input id="expense-amount" name="amount" type="number" step="0.01" min="0.01" placeholder="500.00" value={amount}
                        onChange={(event) => {
                            setAmount(event.target.value)
                            setFieldErrors((currentErrors) => ({
                                ...currentErrors,
                                amount: '',
                            }))
                        }}
                        aria-invalid={Boolean(fieldErrors.amount)}
                        aria-describedby={fieldErrors.amount ? 'expense-amount-error' : undefined}
                    />
                    {fieldErrors.amount && (<p id="expense-amount-error" className="mt-1 text-xs text-red-500">{fieldErrors.amount}</p>)}
                </div>

                <fieldset className="space-y-2">
                    <legend className="text-sm font-medium">Split between</legend>

                    <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
                        {members.map((member) => {
                            const isSelected = selectedMembers.includes(member.userId)

                            return (
                                <label
                                    key={member.userId}
                                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-2 transition-colors 
                                        ${ isSelected ? 'border-blue-200 bg-blue-50' : 'border-transparent hover:bg-gray-50'}
                                    `}
                                >
                                    <input type="checkbox" checked={isSelected} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        onChange={() => toggleMemberSelection(member.userId)}
                                    />

                                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                                        {member.user.name.charAt(0).toUpperCase()}
                                    </div>

                                    <span className="truncate text-sm text-gray-700">
                                        {member.user.id === currentUser?.id ? 'You' : member.user.name}
                                    </span>
                                </label>
                            )
                        })}
                    </div>
                    {fieldErrors.splitBetween && (<p className="mt-1 text-xs text-red-500">{fieldErrors.splitBetween}</p>)}
                </fieldset>

                {splitPreview && (
                    <div className="rounded-lg bg-blue-50 p-3 text-center">
                        <p className="text-sm text-blue-700">₹{splitPreview} per person</p>

                        <p className="mt-0.5 text-xs text-blue-500">
                            Split equally among {selectedMembers.length}{' '}
                            {selectedMembers.length === 1
                                ? 'person'
                                : 'people'}
                        </p>
                    </div>
                )}

                <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Paid by{' '}
                        <span className="font-medium text-gray-700">You ({currentUser?.name})</span>
                    </p>
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => handleOpenChange(false)} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : 'Add Expense'}
                    </Button>
                </div>
            </form>
        </Modal>
    )
}

export default AddExpenseModal; 
