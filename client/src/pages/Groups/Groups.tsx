import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button/Button'
import { Input } from '@/components/ui/Input/Input'
import { Textarea } from '@/components/ui/Textarea/Textarea'
import { Label } from '@/components/ui/Label/Label'
import { setGroups, startGroupsLoading, addGroup, setGroupsError } from '@/store/slices/groupSlice'
import { createGroupSchema, CreateGroupFormData } from '@/validations/group.schema'
import api from '@/api/axios'
import type { RootState, AppDispatch } from '@/store'
import type { Group } from '@/types'

function Groups() {
    const dispatch = useDispatch<AppDispatch>()
    const navigate = useNavigate()
    const { groups, groupsStatus, groupsError } = useSelector((state: RootState) => state.group)

    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [formData, setFormData] = useState<CreateGroupFormData>({ name: '', description: '' });
    const [fieldErrors, setFieldErrors] = useState<Partial<CreateGroupFormData>>({});
    const [creating, setCreating] = useState<boolean>(false);
    const [serverError, setServerError] = useState<string | null>(null);

    const fetchGroups = useCallback(async () => {
        dispatch(startGroupsLoading())
        try {
            const response = await api.get('/groups')
            dispatch(setGroups(response.data.data))
        } catch {
            dispatch(setGroupsError('Unable to load groups. Please check your connection and try again.'))
        }
    }, [dispatch])

    useEffect(() => {
        if (groupsStatus === 'idle') {
            fetchGroups()
        }
    }, [fetchGroups, groupsStatus])


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setFieldErrors({ ...fieldErrors, [e.target.name]: undefined })
    }

    const handleCloseModal = () => {
        setShowCreateModal(false)
        setFormData({ name: '', description: '' })
        setFieldErrors({})
        setServerError(null)
    }

    const handleCreateGroup = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault()
        setServerError(null)
        setFieldErrors({})

        const result = createGroupSchema.safeParse(formData)

        if (!result.success) {
            const errors = result.error.flatten().fieldErrors
            setFieldErrors({
                name: errors.name?.[0],
                description: errors.description?.[0],
            })
            return
        }

        setCreating(true)

        try {
            const response = await api.post('/groups', result.data)
            dispatch(addGroup(response.data.data))
            handleCloseModal()
        } catch (err: unknown) {
            if (err && typeof err === 'object' && 'response' in err) {
                const axiosError = err as { response: { data: { message: string } } }
                setServerError(axiosError.response?.data?.message || 'Something went wrong')
            } else {
                setServerError('Something went wrong')
            }
        } finally {
            setCreating(false)
        }
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Groups</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage your expense groups</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>+ New Group</Button>
            </div>

            {/* Groups List */}
            {groupsStatus === 'loading' ? (
                <div className="flex justify-center py-12">
                    <p className="text-gray-400 text-sm">Loading groups...</p>
                </div>
            ) : groupsError ? (
                    <div className="rounded-xl border bg-white p-12 text-center">
                        <p className="text-sm text-red-600">
                            {groupsError}
                        </p>

                        <Button
                            className="mt-4"
                            variant="outline"
                            onClick={fetchGroups}
                        >
                            Retry
                        </Button>
                    </div>
                ) : groups.length === 0 ? (
                    <div className="bg-white rounded-xl border p-12 text-center">
                        <p className="text-gray-400 text-sm">No groups yet</p>
                        <p className="text-gray-400 text-xs mt-1">Create a group to start splitting expenses</p>
                        <Button className="mt-4" onClick={() => setShowCreateModal(true)}>
                            + Create your first group
                        </Button>
                    </div>
                ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((group: Group) => (
                        <div
                            key={group.id}
                            onClick={() => navigate(`/groups/${group.id}`)}
                            className="bg-white rounded-xl border p-5 cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <h3 className="font-semibold text-gray-800">{group.name}</h3>
                            {group.description && (
                                <p className="text-gray-500 text-sm mt-1 line-clamp-2">{group.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-4 text-xs text-gray-400">
                                <span>{group.members.length} members</span>
                                <span>•</span>
                                <span>{group._count?.expenses ?? 0} expenses</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create New Group</h3>

                        {serverError && (
                            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handleCreateGroup} className="space-y-4">
                            <div className="space-y-1">
                                <Label htmlFor="name">Group Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    placeholder="Trip to Goa"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={fieldErrors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                />
                                {fieldErrors.name && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <Label htmlFor="description">
                                    Description <span className="text-gray-400 font-normal">(optional)</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="What's this group for?"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className={`resize-none ${fieldErrors.description ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                />
                                {fieldErrors.description && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>
                                )}
                            </div>

                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1"
                                    onClick={handleCloseModal}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={creating} className="flex-1">
                                    {creating ? 'Creating...' : 'Create Group'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Groups