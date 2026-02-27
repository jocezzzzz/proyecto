import { CheckCircleIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline'

export default function Stats({ tasks }) {
  // Calcular estadísticas
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.completed).length
  const pendingTasks = totalTasks - completedTasks
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
  
  // Calcular racha (streak) - 1 día por cada 2 tareas completadas
  const streak = Math.floor(completedTasks / 2) + 1

  const stats = [
    {
      name: 'Total',
      value: totalTasks,
      icon: ClockIcon,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      change: `${totalTasks} tareas`
    },
    {
      name: 'Completadas',
      value: completedTasks,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      change: `${completionRate}% del total`
    },
    {
      name: 'Pendientes',
      value: pendingTasks,
      icon: ClockIcon,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      change: `${pendingTasks} por hacer`
    },
    {
      name: 'Racha',
      value: streak,
      icon: FireIcon,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      textColor: 'text-orange-600 dark:text-orange-400',
      change: streak > 3 ? '🔥 Encendido' : '🌱 Empezando',
      suffix: streak === 1 ? 'día' : 'días'
    }
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const displayValue = typeof stat.value === 'number' && stat.suffix 
          ? `${stat.value} ${stat.suffix}`
          : stat.value

        return (
          <div
            key={stat.name}
            className="relative bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group"
          >
            {/* Barra decorativa superior */}
            <div className={`h-1 w-full ${stat.color}`}></div>
            
            <div className="p-4 sm:p-5">
              <div className="flex items-start justify-between mb-3">
                {/* Icono con fondo */}
                <div className={`p-2 rounded-lg ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.textColor}`} />
                </div>
                
                {/* Valor principal */}
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {displayValue}
                  </span>
                </div>
              </div>
              
              {/* Título y cambio */}
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {stat.name}
                </span>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                  {stat.change}
                </span>
              </div>
            </div>

            {/* Efecto de brillo al hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </div>
        )
      })}
    </div>
  )
}