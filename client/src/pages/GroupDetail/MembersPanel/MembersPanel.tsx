import { Button } from '@/components/ui/Button/Button'
import type { GroupMember } from '@/types'

interface MembersPanelProps {
    members: GroupMember[]
    creatorId: string
    canAddMember: boolean
    onAddMember: () => void
}

function MembersPanel({
    members,
    creatorId,
    canAddMember,
    onAddMember,
}: MembersPanelProps) {
    return (
        <div className="rounded-xl border bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-semibold text-gray-800">
                    Members ({members.length})
                </h3>

                {canAddMember && (
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onAddMember}
                    >
                        + Add
                    </Button>
                )}
            </div>

            <div className="space-y-3">
                {members.map((member) => (
                    <div
                        key={member.id}
                        className="flex items-center gap-3"
                    >
                        <div
                            aria-hidden="true"
                            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600"
                        >
                            {member.user.name
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-gray-800">
                                {member.user.name}

                                {member.userId === creatorId && (
                                    <span className="ml-1 text-xs text-gray-400">
                                        (creator)
                                    </span>
                                )}
                            </p>

                            <p className="truncate text-xs text-gray-400">
                                {member.user.email}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default MembersPanel