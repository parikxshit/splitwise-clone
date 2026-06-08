export interface ExpenseSplit {
    id: string
    amount: number
    userId: string
    expenseId: string
    user: {
        id: string
        name: string
        email: string
    }
}

export interface Expense {
    id: string
    description: string
    amount: number
    createdAt: string
    groupId: string
    payerId: string
    payer: {
        id: string
        name: string
        email: string
    }
    splits: ExpenseSplit[]
}

export interface ExpenseState {
    expenses: Expense[]
    loading: boolean
}