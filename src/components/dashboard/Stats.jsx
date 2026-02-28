import { CheckCircleIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline'

export default function Stats({ tasks }) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const pendingTasks = totalTasks - completedTasks
  const streak = Math.floor(completedTasks / 2) + 1

  const stats = [
    { label: 'TOTAL', value: totalTasks, icon: ClockIcon, color: 'blue' },
    { label: 'COMP', value: completedTasks, icon: CheckCircleIcon, color: 'green' },
    { label: 'PEND', value: pendingTasks, icon: ClockIcon, color: 'yellow' },
    { label: 'RACHA', value: streak, icon: FireIcon, color: 'orange' }
  ]

  return (
    <div className="grid grid-cols-4 gap-1">
      {stats.map((stat) => (
        <div 
          key={stat.label}
          className="bg-white dark:bg-gray-800 rounded-lg p-1.5 shadow text-center"
        >
          <stat.icon className={`h-3.5 w-3.5 mx-auto text-${stat.color}-500 mb-0.5`} />
          <div className="text-[10px] font-medium text-gray-500 dark:text-gray-400">
            {stat.label}
          </div>
          <div className="text-xs font-bold text-gray-900 dark:text-white">
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  )
}