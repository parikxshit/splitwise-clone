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
    loading: boolean
}