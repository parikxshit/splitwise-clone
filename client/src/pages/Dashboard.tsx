import { Button } from '@/components/ui/button'

function Dashboard() {
    return (
        <div>
            {/* Welcome Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="text-gray-500 text-sm mt-1">
                    Manage your expenses and settle up with friends
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl border p-5">
                    <p className="text-sm text-gray-500">Total Groups</p>
                    <p className="text-3xl font-bold text-gray-800 mt-1">0</p>
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

            {/* Groups Placeholder */}
            <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Your Groups</h3>
                    <Button disabled className="text-sm">+ New Group</Button>
                </div>

                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-gray-400 text-sm">No groups yet</p>
                    <p className="text-gray-400 text-xs mt-1">Groups and expenses are coming soon</p>
                </div>
            </div>
        </div>
    )
}

export default Dashboard