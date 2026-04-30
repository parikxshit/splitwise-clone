import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Group, GroupState } from '@/types'

const initialState: GroupState = {
    groups: [],
    selectedGroup: null,
    loading: false,
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
    },
})

export const {
    setGroups,
    setSelectedGroup,
    addGroup,
    removeGroup,
    setGroupLoading,
    clearSelectedGroup,
} = groupSlice.actions

export default groupSlice.reducer