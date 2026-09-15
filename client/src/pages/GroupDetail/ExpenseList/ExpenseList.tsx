import { useState } from 'react'

import { Button } from '@/components/ui/Button/Button'
import type { Expense } from '@/types'
import ExpenseItem from '../ExpenseItem/ExpenseItem'

interface ExpenseListProps {
    expenses: Expense[]
    isLoading: boolean
    currentUserId: string | undefined
    groupCreatorId: string
    deletingExpenseId: string | null
    onAddExpense: () => void
    onDeleteExpense: (expenseId: string) => void
}

function ExpenseList({
    expenses,
    isLoading,
    currentUserId,
    groupCreatorId,
    deletingExpenseId,
    onAddExpense,
    onDeleteExpense,
}: ExpenseListProps) {
    const [expandedExpenseId, setExpandedExpenseId] =
        useState<string | null>(null)

    return (
        <div className="rounded-xl border bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                    Expenses
                </h3>

                <Button size="sm" onClick={onAddExpense}>
                    + Add Expense
                </Button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <p className="text-sm text-gray-400">
                        Loading expenses...
                    </p>
                </div>
            ) : expenses.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-sm text-gray-400">
                        No expenses yet
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                        Add an expense to start splitting costs
                    </p>
                </div>
            ) : (
                <div className="divide-y">
                    {expenses.map((expense) => {
                        const canDelete = expense.payerId === currentUserId || groupCreatorId === currentUserId
                        const isExpanded = expandedExpenseId === expense.id

                        return (
                            <ExpenseItem
                                key={expense.id}
                                expense={expense}
                                currentUserId={currentUserId}
                                canDelete={canDelete}
                                isExpanded={isExpanded}
                                isDeleting={deletingExpenseId === expense.id}
                                onToggle={() => setExpandedExpenseId(isExpanded ? null : expense.id)}
                                onDelete={() =>
                                    onDeleteExpense(expense.id)
                                }
                            />
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default ExpenseList