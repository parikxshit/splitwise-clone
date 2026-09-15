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
import ExpenseItem from './ExpenseItem/ExpenseItem'

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
                                    const canDelete = expense.payerId === user?.id || selectedGroup.createdBy === user?.id
                                    const isExpanded = expandedExpenseId === expense.id

                                    return (
                                        <ExpenseItem 
                                            key={expense.id}
                                            expense={expense}
                                            currentUserId={user?.id}
                                            canDelete={canDelete}
                                            isExpanded={isExpanded}
                                            isDeleting={deletingExpenseId === expense.id}
                                            onToggle={() => setExpandedExpenseId(isExpanded ? null : expense.id)}
                                            onDelete={() => handleDeleteExpense(expense.id)}
                                        />
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