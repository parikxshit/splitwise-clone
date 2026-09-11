import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { Label } from '@/components/ui/Label/Label'
import {
    setSelectedGroup,
    clearSelectedGroup,
    removeGroup,
    setExpenses,
    addExpense,
    removeExpense,
    setExpensesLoading,
    clearExpenses,
} from '@/store/slices/groupSlice'
import { createExpenseSchema } from '@/validations/expense.schema'
import api from '@/api/axios'
import type { RootState, AppDispatch } from '@/store'
import type { GroupMember, Expense } from '@/types'

function GroupDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const { selectedGroup, expenses, expensesLoading } = useSelector((state: RootState) => state.group)
    const { user } = useSelector((state: RootState) => state.auth)

    // Page state
    const [pageLoading, setPageLoading] = useState<boolean>(true)
    const [deleting, setDeleting] = useState<boolean>(false)
    const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null)
    const [expandedExpenseId, setExpandedExpenseId] = useState<string | null>(null)

    // Add Member modal state
    const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false)
    const [email, setEmail] = useState<string>('')
    const [emailError, setEmailError] = useState<string | null>(null)
    const [addingMember, setAddingMember] = useState<boolean>(false)
    const [memberServerError, setMemberServerError] = useState<string | null>(null)

    // Add Expense modal state
    const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false)
    const [expenseDescription, setExpenseDescription] = useState<string>('')
    const [expenseAmount, setExpenseAmount] = useState<string>('')
    const [selectedMembers, setSelectedMembers] = useState<string[]>([])
    const [expenseFieldErrors, setExpenseFieldErrors] = useState<Record<string, string>>({})
    const [expenseServerError, setExpenseServerError] = useState<string | null>(null)
    const [creatingExpense, setCreatingExpense] = useState<boolean>(false)

    const isCreator = selectedGroup?.createdBy === user?.id

    // ─── Fetch group details ───
    useEffect(() => {
        const fetchGroup = async () => {
            setPageLoading(true)
            try {
                const response = await api.get(`/groups/${id}`)
                dispatch(setSelectedGroup(response.data.data))
            } catch {
                navigate('/groups')
            } finally {
                setPageLoading(false)
            }
        }

        fetchGroup()

        return () => {
            dispatch(clearSelectedGroup())
            dispatch(clearExpenses())
        }
    }, [id, dispatch, navigate])

    // ─── Fetch expenses once group is loaded ───
    useEffect(() => {
        if (!selectedGroup) return

        const fetchExpenses = async () => {
            dispatch(setExpensesLoading(true))
            try {
                const response = await api.get(`/groups/${id}/expenses`)
                dispatch(setExpenses(response.data.data))
            } catch {
                dispatch(setExpensesLoading(false))
            }
        }

        fetchExpenses()
    }, [selectedGroup, id, dispatch])

    // ─── Add Member ───
    const handleAddMember = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setEmailError(null)
        setMemberServerError(null)

        if (!email) {
            setEmailError('Email is required')
            return
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setEmailError('Please enter a valid email address')
            return
        }

        setAddingMember(true)

        try {
            const response = await api.post(`/groups/${id}/members`, { email })
            const updatedGroup = {
                ...selectedGroup!,
                members: [...selectedGroup!.members, response.data.data],
            }
            dispatch(setSelectedGroup(updatedGroup))
            setShowAddMemberModal(false)
            setEmail('')
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response: { data: { message: string } } }
                setMemberServerError(axiosError.response?.data?.message || 'Something went wrong')
            } else {
                setMemberServerError('Something went wrong')
            }
        } finally {
            setAddingMember(false)
        }
    }

    // ─── Delete Group ───
    const handleDeleteGroup = async () => {
        if (!confirm('Are you sure you want to delete this group? This cannot be undone.')) return

        setDeleting(true)

        try {
            await api.delete(`/groups/${id}`)
            dispatch(removeGroup(id!))
            navigate('/groups')
        } catch {
            setDeleting(false)
        }
    }

    // ─── Add Expense ───
    const handleOpenExpenseModal = () => {
        // Pre-select all members by default
        if (selectedGroup) {
            setSelectedMembers(selectedGroup.members.map((m) => m.userId))
        }
        setShowAddExpenseModal(true)
    }

    const handleCloseExpenseModal = () => {
        setShowAddExpenseModal(false)
        setExpenseDescription('')
        setExpenseAmount('')
        setSelectedMembers([])
        setExpenseFieldErrors({})
        setExpenseServerError(null)
    }

    const toggleMemberSelection = (userId: string) => {
        setSelectedMembers((prev) =>
            prev.includes(userId)
                ? prev.filter((id) => id !== userId)
                : [...prev, userId]
        )
        setExpenseFieldErrors((prev) => ({ ...prev, splitBetween: '' }))
    }

    const handleCreateExpense = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setExpenseServerError(null)
        setExpenseFieldErrors({})

        const parsedAmount = parseFloat(expenseAmount)

        const result = createExpenseSchema.safeParse({
            description: expenseDescription,
            amount: isNaN(parsedAmount) ? undefined : parsedAmount,
            splitBetween: selectedMembers,
        })

        if (!result.success) {
            const errors: Record<string, string> = {}
            result.error.errors.forEach((err) => {
                const field = err.path[0]?.toString()
                if (field && !errors[field]) {
                    errors[field] = err.message
                }
            })
            setExpenseFieldErrors(errors)
            return
        }

        setCreatingExpense(true)

        try {
            const response = await api.post(`/groups/${id}/expenses`, result.data)
            dispatch(addExpense(response.data.data))
            handleCloseExpenseModal()
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response: { data: { message: string } } }
                setExpenseServerError(axiosError.response?.data?.message || 'Something went wrong')
            } else {
                setExpenseServerError('Something went wrong')
            }
        } finally {
            setCreatingExpense(false)
        }
    }

    // ─── Delete Expense ───
    const handleDeleteExpense = async (expenseId: string) => {
        if (!confirm('Delete this expense?')) return

        setDeletingExpenseId(expenseId)

        try {
            await api.delete(`/expenses/${expenseId}`)
            dispatch(removeExpense(expenseId))
        } catch {
            // silently fail
        } finally {
            setDeletingExpenseId(null)
        }
    }

    // ─── Helpers ───
    const handleCloseMemberModal = () => {
        setShowAddMemberModal(false)
        setEmail('')
        setEmailError(null)
        setMemberServerError(null)
    }

    const formatTimeAgo = (dateStr: string) => {
        const now = new Date()
        const date = new Date(dateStr)
        const diffMs = now.getTime() - date.getTime()
        const diffMins = Math.floor(diffMs / 60000)

        if (diffMins < 1) return 'just now'
        if (diffMins < 60) return `${diffMins}m ago`

        const diffHours = Math.floor(diffMins / 60)
        if (diffHours < 24) return `${diffHours}h ago`

        const diffDays = Math.floor(diffHours / 24)
        if (diffDays < 7) return `${diffDays}d ago`

        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    }

    const splitPreview =
        selectedMembers.length > 0 && expenseAmount && !isNaN(parseFloat(expenseAmount))
            ? (parseFloat(expenseAmount) / selectedMembers.length).toFixed(2)
            : null

    // ─── Loading / Not Found ───
    if (pageLoading) {
        return (
            <div className="flex justify-center py-12">
                <p className="text-gray-400 text-sm">Loading group...</p>
            </div>
        )
    }

    if (!selectedGroup) return null

    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <button
                        onClick={() => navigate('/groups')}
                        className="text-sm text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1"
                    >
                        ← Back to Groups
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedGroup.name}</h2>
                    {selectedGroup.description && (
                        <p className="text-gray-500 text-sm mt-1">{selectedGroup.description}</p>
                    )}
                </div>

                {isCreator && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeleteGroup}
                        disabled={deleting}
                    >
                        {deleting ? 'Deleting...' : 'Delete Group'}
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ─── Members Section ─── */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-xl border p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">
                                Members ({selectedGroup.members.length})
                            </h3>
                            {isCreator && (
                                <Button size="sm" variant="outline" onClick={() => setShowAddMemberModal(true)}>
                                    + Add
                                </Button>
                            )}
                        </div>

                        <div className="space-y-3">
                            {selectedGroup.members.map((member: GroupMember) => (
                                <div key={member.id} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium flex-shrink-0">
                                        {member.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">
                                            {member.user.name}
                                            {member.userId === selectedGroup.createdBy && (
                                                <span className="text-xs text-gray-400 ml-1">(creator)</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">{member.user.email}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ─── Expenses Section ─── */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">Expenses</h3>
                            <Button size="sm" onClick={handleOpenExpenseModal}>
                                + Add Expense
                            </Button>
                        </div>

                        {expensesLoading ? (
                            <div className="flex justify-center py-12">
                                <p className="text-gray-400 text-sm">Loading expenses...</p>
                            </div>
                        ) : expenses.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <p className="text-gray-400 text-sm">No expenses yet</p>
                                <p className="text-gray-400 text-xs mt-1">
                                    Add an expense to start splitting costs
                                </p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {expenses.map((expense: Expense) => {
                                    const canDelete =
                                        expense.payerId === user?.id || selectedGroup.createdBy === user?.id
                                    const isExpanded = expandedExpenseId === expense.id

                                    return (
                                        <div key={expense.id} className="py-3">
                                            {/* Expense row */}
                                            <div className="flex items-center justify-between">
                                                <div
                                                    className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                                                    onClick={() =>
                                                        setExpandedExpenseId(isExpanded ? null : expense.id)
                                                    }
                                                >
                                                    {/* Payer avatar */}
                                                    <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-sm font-medium flex-shrink-0">
                                                        {expense.payer.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm text-gray-800 truncate">
                                                            <span className="font-medium">
                                                                {expense.payer.id === user?.id
                                                                    ? 'You'
                                                                    : expense.payer.name}
                                                            </span>{' '}
                                                            paid{' '}
                                                            <span className="font-semibold text-gray-900">
                                                                ₹{Number(expense.amount).toFixed(2)}
                                                            </span>{' '}
                                                            for{' '}
                                                            <span className="font-medium">
                                                                {expense.description}
                                                            </span>
                                                        </p>
                                                        <p className="text-xs text-gray-400 mt-0.5">
                                                            Split between {expense.splits.length} people •{' '}
                                                            {formatTimeAgo(expense.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                                                    <button
                                                        onClick={() =>
                                                            setExpandedExpenseId(isExpanded ? null : expense.id)
                                                        }
                                                        className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
                                                    >
                                                        {isExpanded ? '▲' : '▼'}
                                                    </button>
                                                    {canDelete && (
                                                        <button
                                                            onClick={() => handleDeleteExpense(expense.id)}
                                                            disabled={deletingExpenseId === expense.id}
                                                            className="text-xs text-red-400 hover:text-red-600 px-2 py-1 disabled:opacity-50"
                                                        >
                                                            {deletingExpenseId === expense.id ? '...' : '✕'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Expanded split details */}
                                            {isExpanded && (
                                                <div className="mt-3 ml-12 bg-gray-50 rounded-lg p-3 space-y-2">
                                                    {expense.splits.map((split) => (
                                                        <div
                                                            key={split.id}
                                                            className="flex items-center justify-between text-sm"
                                                        >
                                                            <span className="text-gray-600">
                                                                {split.user.id === user?.id
                                                                    ? 'You'
                                                                    : split.user.name}
                                                            </span>
                                                            <span className="text-gray-800 font-medium">
                                                                ₹{Number(split.amount).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ─── Add Member Modal ─── */}
            {showAddMemberModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Member</h3>

                        {memberServerError && (
                            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                                {memberServerError}
                            </div>
                        )}

                        <form onSubmit={handleAddMember} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="friend@example.com"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value)
                                        setEmailError(null)
                                    }}
                                    className={emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                />
                                {emailError && (
                                    <p className="text-red-500 text-xs mt-1">{emailError}</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleCloseMemberModal}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={addingMember} className="flex-1">
                                    {addingMember ? 'Adding...' : 'Add Member'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ─── Add Expense Modal ─── */}
            {showAddExpenseModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add Expense</h3>

                        {expenseServerError && (
                            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                                {expenseServerError}
                            </div>
                        )}

                        <form onSubmit={handleCreateExpense} className="space-y-4">
                            {/* Description */}
                            <div className="space-y-1">
                                <Label htmlFor="expense-description">Description</Label>
                                <Input
                                    id="expense-description"
                                    placeholder="Dinner, Uber, Groceries..."
                                    value={expenseDescription}
                                    onChange={(e) => {
                                        setExpenseDescription(e.target.value)
                                        setExpenseFieldErrors((prev) => ({ ...prev, description: '' }))
                                    }}
                                    className={
                                        expenseFieldErrors.description
                                            ? 'border-red-500 focus-visible:ring-red-500'
                                            : ''
                                    }
                                />
                                {expenseFieldErrors.description && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {expenseFieldErrors.description}
                                    </p>
                                )}
                            </div>

                            {/* Amount */}
                            <div className="space-y-1">
                                <Label htmlFor="expense-amount">Amount (₹)</Label>
                                <Input
                                    id="expense-amount"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="500.00"
                                    value={expenseAmount}
                                    onChange={(e) => {
                                        setExpenseAmount(e.target.value)
                                        setExpenseFieldErrors((prev) => ({ ...prev, amount: '' }))
                                    }}
                                    className={
                                        expenseFieldErrors.amount
                                            ? 'border-red-500 focus-visible:ring-red-500'
                                            : ''
                                    }
                                />
                                {expenseFieldErrors.amount && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {expenseFieldErrors.amount}
                                    </p>
                                )}
                            </div>

                            {/* Split Between */}
                            <div className="space-y-2">
                                <Label>Split between</Label>
                                <div className="border rounded-lg p-3 space-y-2 max-h-48 overflow-y-auto">
                                    {selectedGroup!.members.map((member: GroupMember) => {
                                        const isSelected = selectedMembers.includes(member.userId)
                                        return (
                                            <label
                                                key={member.userId}
                                                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                                                    isSelected
                                                        ? 'bg-blue-50 border border-blue-200'
                                                        : 'hover:bg-gray-50 border border-transparent'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleMemberSelection(member.userId)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium flex-shrink-0">
                                                    {member.user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="text-sm text-gray-700 truncate">
                                                    {member.user.id === user?.id ? 'You' : member.user.name}
                                                </span>
                                            </label>
                                        )
                                    })}
                                </div>
                                {expenseFieldErrors.splitBetween && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {expenseFieldErrors.splitBetween}
                                    </p>
                                )}
                            </div>

                            {/* Split Preview */}
                            {splitPreview && (
                                <div className="bg-blue-50 rounded-lg p-3 text-center">
                                    <p className="text-sm text-blue-700">
                                        ₹{splitPreview} per person
                                    </p>
                                    <p className="text-xs text-blue-500 mt-0.5">
                                        Split equally among {selectedMembers.length}{' '}
                                        {selectedMembers.length === 1 ? 'person' : 'people'}
                                    </p>
                                </div>
                            )}

                            {/* Paying info */}
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500">
                                    Paid by <span className="font-medium text-gray-700">You ({user?.name})</span>
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleCloseExpenseModal}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creatingExpense} className="flex-1">
                                    {creatingExpense ? 'Adding...' : 'Add Expense'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default GroupDetail