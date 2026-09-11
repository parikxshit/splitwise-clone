import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button/Button'
import { setGroups, setGroupLoading } from '@/store/slices/groupSlice'
import api from '@/api/axios'
import type { RootState, AppDispatch } from '@/store'
import type { Group } from '@/types'

function Dashboard() {
    const navigate = useNavigate()
    const dispatch = useDispatch<AppDispatch>()
    const { groups } = useSelector((state: RootState) => state.group)
    const { user } = useSelector((state: RootState) => state.auth)

    useEffect(() => {
        if (groups.length === 0) {
            const fetchGroups = async () => {
                dispatch(setGroupLoading(true))
                try {
                    const response = await api.get('/groups')
                    dispatch(setGroups(response.data.data))
                } catch {
                    dispatch(setGroupLoading(false))
                }
            }
            fetchGroups()
        }
    }, [dispatch, groups.length])

    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">
                    Welcome back, {user?.name} 👋
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                    Manage your expenses and settle up with friends
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl border p-5">
                    <p className="text-sm text-gray-500">Total Groups</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">{groups.length}</p>
                </div>
                <div className="bg-white rounded-xl border p-5">
                    <p className="text-sm text-gray-500">You are owed</p>
                    <p className="text-3xl font-bold text-green-600 mt-1">₹0</p>
                </div>
                <div className="bg-white rounded-xl border p-5">
                    <p className="text-sm text-gray-500">You owe</p>
                    <p className="text-3xl font-bold text-red-500 mt-1">₹0</p>
                </div>
            </div>

            {/* Recent Groups */}
            <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Recent Groups</h3>
                    <Button size="sm" variant="outline" onClick={() => navigate('/groups')}>
                        View all
                    </Button>
                </div>

                {groups.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <p className="text-gray-400 text-sm">No groups yet</p>
                        <p className="text-gray-400 text-xs mt-1">
                            Create a group to start splitting expenses
                        </p>
                        <Button className="mt-4" onClick={() => navigate('/groups')}>
                            + Create a group
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y">
                        {groups.slice(0, 5).map((group: Group) => (
                            <div
                                key={group.id}
                                onClick={() => navigate(`/groups/${group.id}`)}
                                className="flex items-center justify-between py-3 cursor-pointer hover:bg-gray-50 px-2 rounded-lg transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-800">{group.name}</p>
                                    <p className="text-xs text-gray-400">{group.members.length} members</p>
                                </div>
                                <p className="text-xs text-gray-400">{group._count?.expenses ?? 0} expenses</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dashboard