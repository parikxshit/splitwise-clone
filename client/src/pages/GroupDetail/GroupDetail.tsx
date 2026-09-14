import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@/components/ui/Button/Button'
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
import api from '@/api/axios'
import type { RootState, AppDispatch } from '@/store'
import type { GroupMember, Expense } from '@/types'
import AddMemberModal  from './AddMemberModal/AddMemberModal';
import AddExpenseModal  from './AddExpenseModal/AddExpenseModal';
import MembersPanel from './MembersPanel/MembersPanel'

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

    // Add Expense modal state
    const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false)

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
    const handleMemberAdded = (member: GroupMember) => {
        if (!selectedGroup) return
        dispatch(
            setSelectedGroup({
                ...selectedGroup,
                members: [...selectedGroup.members, member],
            }),
        )
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
    const handleExpenseAdded = (expense: Expense) => {
        dispatch(addExpense(expense))
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
                    <MembersPanel
                        members={selectedGroup.members}
                        creatorId={selectedGroup.createdBy}
                        canAddMember={isCreator}
                        onAddMember={() => setShowAddMemberModal(true)}
                    />
                </div>

                {/* ─── Expenses Section ─── */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-800">Expenses</h3>
                            <Button size="sm" onClick={() => setShowAddExpenseModal(true)}>
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
            <AddMemberModal
                open={showAddMemberModal}
                onOpenChange={setShowAddMemberModal}
                groupId={selectedGroup.id}
                onMemberAdded={handleMemberAdded}
            />

            {/* ─── Add Expense Modal ─── */}
            {showAddExpenseModal && (
                <AddExpenseModal
                    open={showAddExpenseModal}
                    onOpenChange={setShowAddExpenseModal}
                    groupId={selectedGroup.id}
                    members={selectedGroup.members}
                    currentUser={user}
                    onExpenseAdded={handleExpenseAdded}
                />
            )}
        </div>
    )
}

export default GroupDetail;