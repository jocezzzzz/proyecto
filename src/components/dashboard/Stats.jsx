import { CheckCircleIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline'

export default function Stats({ tasks }) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const pendingTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // Racha simulada (podrías guardarla en DB después)
  const streak = Math.floor(completedTasks / 2) + 1

  const stats = [
    {
      name: 'Tareas Totales',
      value: totalTasks,
      icon: ClockIcon,
      color: 'bg-blue-500',
      change: `${totalTasks} tareas`
    },
    {
      name: 'Completadas',
      value: completedTasks,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      change: `${completionRate}% del total`
    },
    {
      name: 'Pendientes',
      value: pendingTasks,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      change: `${pendingTasks} por hacer`
    },
    {
      name: 'Racha Actual',
      value: `${streak} días`,
      icon: FireIcon,
      color: 'bg-orange-500',
      change: completionRate > 50 ? '🔥 Encendido' : '🌱 Empezando'
    }
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative bg-white dark:bg-gray-800 pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <dt>
            <div className={`absolute rounded-md p-3 ${stat.color} shadow-lg`}>
              <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
              {stat.name}
            </p>
          </dt>
          <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {stat.value}
            </p>
            <p className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
              {stat.change}
            </p>
          </dd>
        </div>
      ))}
    </div>
  )
}