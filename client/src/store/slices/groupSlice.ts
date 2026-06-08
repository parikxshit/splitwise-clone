import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Group, GroupState, Expense } from '@/types'

const initialState: GroupState = {
    groups: [],
    selectedGroup: null,
    loading: false,
    expenses: [],
    expensesLoading: false,
}

const groupSlice = createSlice({
    name: 'group',
    initialState,
    reducers: {
        setGroups: (state, action: PayloadAction<Group[]>) => {
            state.groups = action.payload
            state.loading = false
        },
        setSelectedGroup: (state, action: PayloadAction<Group>) => {
            state.selectedGroup = action.payload
            state.loading = false
        },
        addGroup: (state, action: PayloadAction<Group>) => {
            state.groups.unshift(action.payload)
        },
        removeGroup: (state, action: PayloadAction<string>) => {
            state.groups = state.groups.filter((g) => g.id !== action.payload)
        },
        setGroupLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload
        },
        clearSelectedGroup: (state) => {
            state.selectedGroup = null
        },
        setExpenses: (state, action: PayloadAction<Expense[]>) => {
            state.expenses = action.payload
            state.expensesLoading = false
        },
        addExpense: (state, action: PayloadAction<Expense>) => {
            state.expenses.unshift(action.payload)
        },
        removeExpense: (state, action: PayloadAction<string>) => {
            state.expenses = state.expenses.filter((e) => e.id !== action.payload)
        },
        setExpensesLoading: (state, action: PayloadAction<boolean>) => {
            state.expensesLoading = action.payload
        },
        clearExpenses: (state) => {
            state.expenses = []
        },
    },
})

export const {
    setGroups,
    setSelectedGroup,
    addGroup,
    removeGroup,
    setGroupLoading,
    clearSelectedGroup,
    setExpenses,
    addExpense,
    removeExpense,
    setExpensesLoading,
    clearExpenses,
} = groupSlice.actions

export default groupSlice.reducer