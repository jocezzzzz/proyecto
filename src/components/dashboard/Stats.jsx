import { CheckCircleIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline'

export default function Stats({ tasks }) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const pendingTasks = totalTasks - completedTasks
  const streak = Math.floor(completedTasks / 2) + 1

  const stats = [
    { label: 'TOTAL', value: totalTasks, icon: ClockIcon },
    { label: 'COMP', value: completedTasks, icon: CheckCircleIcon },
    { label: 'PEND', value: pendingTasks, icon: ClockIcon },
    { label: 'RACHA', value: streak, icon: FireIcon }
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat, i) => {
        const Icon = stat.icon
        return (
          <div key={i} className="bg-white rounded-lg p-3 text-center shadow-sm">
            <Icon className="h-5 w-5 mx-auto text-indigo-500 mb-1" />
            <div className="text-xs text-gray-500">{stat.label}</div>
            <div className="text-lg font-bold text-gray-900">{stat.value}</div>
          </div>
        )
      })}
    </div>
  )
}