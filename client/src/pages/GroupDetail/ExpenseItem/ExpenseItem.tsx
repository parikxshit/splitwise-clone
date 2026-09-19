import type { Expense } from '@/types'

interface ExpenseItemProps {
    expense: Expense
    currentUserId: string | undefined
    canDelete: boolean
    isExpanded: boolean
    isDeleting: boolean
    onToggle: () => void
    onDelete: () => void
}

function ExpenseItem({
    expense,
    currentUserId,
    canDelete,
    isExpanded,
    isDeleting,
    onToggle,
    onDelete,
}: ExpenseItemProps) {
    const formatTimeAgo = (dateString: string) => {
        const now = new Date()
        const date = new Date(dateString)
        const differenceInMilliseconds =
            now.getTime() - date.getTime()

        const differenceInMinutes = Math.floor(
            differenceInMilliseconds / 60_000,
        )

        if (differenceInMinutes < 1) {
            return 'just now'
        }

        if (differenceInMinutes < 60) {
            return `${differenceInMinutes}m ago`
        }

        const differenceInHours = Math.floor(
            differenceInMinutes / 60,
        )

        if (differenceInHours < 24) {
            return `${differenceInHours}h ago`
        }

        const differenceInDays = Math.floor(
            differenceInHours / 24,
        )

        if (differenceInDays < 7) {
            return `${differenceInDays}d ago`
        }

        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
        })
    }

    return (
        <div className="py-3">
            <div className="flex items-center justify-between">
                <button
                    type="button"
                    onClick={onToggle}
                    aria-expanded={isExpanded}
                    aria-label={
                        isExpanded
                        ? `Hide split details for ${expense.description}`
                        : `Show split details for ${expense.description}`
                    }
                    className="flex min-w-0 flex-1 items-center gap-3 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                    <div
                        aria-hidden="true"
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-medium text-emerald-600"
                    >
                        {expense.payer.name
                            .charAt(0)
                            .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-gray-800">
                            <span className="font-medium">
                                {expense.payer.id === currentUserId
                                    ? 'You'
                                    : expense.payer.name}
                            </span>{' '}
                            paid{' '}
                            <span className="font-semibold text-gray-900">
                                ₹{Number(expense.amount).toFixed(2)}
                            </span>{' '}
                            for{' '}
                            <span className="font-medium">
                                {expense.description}
                            </span>
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                            Split between {expense.splits.length}{' '}
                            people •{' '}
                            {formatTimeAgo(expense.createdAt)}
                        </p>
                    </div>
                </button>

                <div className="ml-3 flex shrink-0 items-center gap-2">
                    <button
                        type="button"
                        onClick={onToggle}
                        aria-label={
                            isExpanded
                                ? `Hide split details for ${expense.description}`
                                : `Show split details for ${expense.description}`
                        }
                        aria-expanded={isExpanded}
                        className="px-2 py-1 text-xs text-gray-400 hover:text-gray-600"
                    >
                        {isExpanded ? '▲' : '▼'}
                    </button>

                    {canDelete && (
                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={isDeleting}
                            aria-label={`Delete ${expense.description}`}
                            className="px-2 py-1 text-xs text-red-400 hover:text-red-600 disabled:opacity-50"
                        >
                            {isDeleting ? '...' : '✕'}
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div className="ml-12 mt-3 space-y-2 rounded-lg bg-gray-50 p-3">
                    {expense.splits.map((split) => (
                        <div
                            key={split.id}
                            className="flex items-center justify-between text-sm"
                        >
                            <span className="text-gray-600">
                                {split.user.id === currentUserId
                                    ? 'You'
                                    : split.user.name}
                            </span>

                            <span className="font-medium text-gray-800">
                                ₹{Number(split.amount).toFixed(2)}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ExpenseItem