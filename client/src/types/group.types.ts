import { Expense } from './expense.types'

export interface GroupMember {
    id: string
    userId: string
    groupId: string
    joinedAt: string
    user: {
        id: string
        name: string
        email: string
    }
}

export interface Group {
    id: string
    name: string
    description: string | null
    createdBy: string
    createdAt: string
    updatedAt: string
    members: GroupMember[]
    _count?: {
        expenses: number
    }
}

export interface GroupState {
    groups: Group[]
    selectedGroup: Group | null
    groupsStatus: GroupsStatus
    groupsError: string | null
    expenses: Expense[]
    expensesLoading: boolean
    expensesError: string | null
}

export type GroupsStatus =
    | 'idle'
    | 'loading'
    | 'succeeded'
    | 'failed'