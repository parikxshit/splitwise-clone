import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { clearCredentials } from './authSlice'
import { Group, GroupState, Expense } from '@/types'

const initialState: GroupState = {
    groups: [],
    selectedGroup: null,
    groupsStatus: 'idle',
    groupsError: null,
    expenses: [],
    expensesLoading: false,
    expensesError: null,
}

const groupSlice = createSlice({
    name: 'group',
    initialState,
    reducers: {
        setGroups: (state, action: PayloadAction<Group[]>) => {
            state.groups = action.payload
            state.groupsError = null
            state.groupsStatus = 'succeeded'
        },
        setSelectedGroup: (state, action: PayloadAction<Group>) => {
            state.selectedGroup = action.payload
        },
        addGroup: (state, action: PayloadAction<Group>) => {
            state.groups.unshift(action.payload)
            state.groupsStatus = 'succeeded'
            state.groupsError = null
        },
        removeGroup: (state, action: PayloadAction<string>) => {
            state.groups = state.groups.filter((g) => g.id !== action.payload)
        },
        startGroupsLoading: (state) => {
            state.groupsStatus = 'loading'
            state.groupsError = null
        },
        setGroupsError: (state, action: PayloadAction<string>) => {
            state.groupsStatus = 'failed'
            state.groupsError = action.payload
        },
        clearSelectedGroup: (state) => {
            state.selectedGroup = null
        },
        setExpenses: (state, action: PayloadAction<Expense[]>) => {
            state.expenses = action.payload
            state.expensesLoading = false
            state.expensesError = null
        },
        addExpense: (state, action: PayloadAction<Expense>) => {
            state.expenses.unshift(action.payload)
        },
        removeExpense: (state, action: PayloadAction<string>) => {
            state.expenses = state.expenses.filter((e) => e.id !== action.payload)
        },
        startExpensesLoading: (state) => {
            state.expensesLoading = true
            state.expensesError = null
        },
        setExpensesError: (state, action: PayloadAction<string>) => {
            state.expensesLoading = false
            state.expensesError = action.payload
        },
        clearExpenses: (state) => {
            state.expenses = [];
            state.expensesLoading = false
            state.expensesError = null
        },
    },
    extraReducers: (builder) => {
        builder.addCase(clearCredentials, () => initialState)
    },
})

export const {
    setGroups,
    setSelectedGroup,
    addGroup,
    removeGroup,
    startGroupsLoading,
    setGroupsError,
    clearSelectedGroup,
    setExpenses,
    addExpense,
    removeExpense,
    startExpensesLoading,
    setExpensesError,
    clearExpenses,
} = groupSlice.actions

export default groupSlice.reducer