import { useEffect, useState, useCallback } from 'react'
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
    startExpensesLoading,
    setExpensesError,
    clearExpenses,
} from '@/store/slices/groupSlice'
import api from '@/api/axios'
import type { RootState, AppDispatch } from '@/store'
import type { GroupMember, Expense } from '@/types'
import AddMemberModal  from './AddMemberModal/AddMemberModal';
import AddExpenseModal  from './AddExpenseModal/AddExpenseModal';
import MembersPanel from './MembersPanel/MembersPanel'
import ExpenseList from './ExpenseList/ExpenseList'

function GroupDetail() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()

    const { selectedGroup, expenses, expensesLoading, expensesError } = useSelector((state: RootState) => state.group)
    const { user } = useSelector((state: RootState) => state.auth)

    // Page state
    const [pageLoading, setPageLoading] = useState<boolean>(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false)
    const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    // Add Member modal state
    const [showAddMemberModal, setShowAddMemberModal] = useState<boolean>(false)

    // Add Expense modal state
    const [showAddExpenseModal, setShowAddExpenseModal] = useState<boolean>(false)

    const isCreator = selectedGroup?.createdBy === user?.id

    // ─── Fetch group details ───
    // const fetchGroup = useCallback(async () => {
    //     if (!id) return
    //     try {
    //         const response = await api.get(`/groups/${id}`)
    //         dispatch(setSelectedGroup(response.data.data))
    //     } catch {
    //         setPageError('Unable to load this group. Please check your connection and try again.')
    //     } finally {
    //         setPageLoading(false)
    //     }
    // }, [dispatch, id]);

    const handleRetryGroup = () => {
        setPageLoading(true)
        setPageError(null)

        api
        .get(`/groups/${id}`)
        .then((response) => {
            dispatch(setSelectedGroup(response.data.data))
        })
        .catch(() => {
            setPageError('Unable to load this group. Please check your connection and try again.')
        })
        .finally(() => {
            setPageLoading(false)
        })
    }

    useEffect(() => {
        let isCurrent = true
        api
        .get(`/groups/${id}`)
        .then((response) => {
            if (isCurrent) {
                dispatch(setSelectedGroup(response.data.data))
            }
        })
        .catch(() => {
            console.error('Error fetching group details')
            if (isCurrent) {
                setPageError('Unable to load this group. Please check your connection and try again.',)
            }
        })
        .finally(() => {
            if (isCurrent) {
                setPageLoading(false)
            }
        })

        return () => {
            isCurrent = false
            dispatch(clearSelectedGroup())
            dispatch(clearExpenses())
        }
    }, [dispatch, id])

    // ─── Fetch expenses once group is loaded ───
    const fetchExpenses = useCallback(async () => {
        if (!id) return
        dispatch(startExpensesLoading())
        try {
            const response = await api.get(`/groups/${id}/expenses`)
            dispatch(setExpenses(response.data.data))
        } catch {
            dispatch(setExpensesError('Unable to load expenses. Please check your connection and try again.'))
        }
        }, [dispatch, id])

    useEffect(() => {
        if (!selectedGroup) return
        fetchExpenses()
    }, [fetchExpenses, selectedGroup])

    // ─── After member is added ───
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
        setActionError(null)
        setDeleting(true)
        try {
            await api.delete(`/groups/${id}`)
            dispatch(removeGroup(id!))
            navigate('/groups')
        } catch {
            setActionError('Unable to delete this group. Please try again.');
            setDeleting(false)
        }
    };

    // ─── After Expense is Added ───
    const handleExpenseAdded = (expense: Expense) => {
        dispatch(addExpense(expense))
    }

    // ─── Delete Expense ───
    const handleDeleteExpense = async (expenseId: string) => {
        if (!confirm('Delete this expense?')) return;
        setActionError(null)
        setDeletingExpenseId(expenseId)
        try {
            await api.delete(`/expenses/${expenseId}`)
            dispatch(removeExpense(expenseId))
        } catch {
            setActionError('Unable to delete this expense. Please try again.')
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

    if (pageError) {
        console.error('Error loading group:', pageError)
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-sm text-red-700">{pageError}</p>
                <div className="mt-4 flex justify-center gap-3">
                    <Button type="button" variant="outline" onClick={() => navigate('/groups')}>Back to Groups</Button>
                    <Button type="button" onClick={handleRetryGroup}>Retry</Button>
                </div>
            </div>
        )
    }

    if (!selectedGroup) return null;


    return (
        <div>
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <button onClick={() => navigate('/groups')} className="text-sm text-gray-400 hover:text-gray-600 mb-2 flex items-center gap-1">
                        ← Back to Groups
                    </button>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedGroup.name}</h2>
                    {selectedGroup.description && (<p className="text-gray-500 text-sm mt-1">{selectedGroup.description}</p>)}
                </div>

                {isCreator && (
                    <Button variant="destructive" size="sm" onClick={handleDeleteGroup} disabled={deleting}>
                        {deleting ? 'Deleting...' : 'Delete Group'}
                    </Button>
                )}
            </div>

            {actionError && (
                <div
                    role="alert"
                    className="mb-6 flex items-center justify-between gap-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
                >
                    <p>{actionError}</p>

                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-red-700 hover:bg-red-100"
                        onClick={() => setActionError(null)}
                    >
                        Dismiss
                    </Button>
                </div>
            )}

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
                    <ExpenseList 
                        expenses={expenses}
                        isLoading={expensesLoading}
                        currentUserId={user?.id}
                        groupCreatorId={selectedGroup.createdBy}
                        deletingExpenseId={deletingExpenseId}
                        onAddExpense={() => setShowAddExpenseModal(true)}
                        onDeleteExpense={handleDeleteExpense}
                        expensesError={expensesError}
                        onRetry={fetchExpenses}
                    />
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