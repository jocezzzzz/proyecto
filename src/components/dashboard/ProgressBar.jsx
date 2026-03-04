import { useState, useEffect } from 'react'

export default function ProgressBar({ tasks }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (tasks.length === 0) {
      setProgress(0)
      return
    }

    const completed = tasks.filter(t => t.completed).length
    const percentage = Math.round((completed / tasks.length) * 100)
    setProgress(percentage)
  }, [tasks])

  const getMessage = () => {
    if (progress === 0) return '🌱 empieza con tus tareas'
    if (progress < 25) return '💪 vamos, tú puedes'
    if (progress < 50) return '📈 buen inicio'
    if (progress < 75) return '⚡ vas muy bien'
    if (progress < 100) return '🎯 casi llegas'
    return '✨ meta cumplida'
  }

  const getGradient = () => {
    if (progress < 25) return 'from-indigo-400 to-purple-400'
    if (progress < 50) return 'from-indigo-500 to-purple-500'
    if (progress < 75) return 'from-indigo-600 to-purple-600'
    if (progress < 100) return 'from-indigo-700 to-purple-700'
    return 'from-pink-500 to-rose-500'
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-indigo-100">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-medium text-indigo-600 uppercase tracking-wider">
          progreso general
        </h3>
        <span className="text-sm font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          {progress}%
        </span>
      </div>

      {/* Barra de progreso con gradiente */}
      <div className="h-3 bg-indigo-100 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full bg-gradient-to-r ${getGradient()} transition-all duration-500 ease-out rounded-full shadow-inner`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Mensaje */}
      <p className="text-xs text-center text-indigo-500 mb-4">
        {getMessage()}
      </p>

      {/* Estadísticas rápidas con diseño */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-indigo-50 rounded-xl p-3 text-center">
          <span className="block text-xs text-indigo-400 mb-1">total</span>
          <span className="text-lg font-bold text-indigo-600">{tasks.length}</span>
        </div>
        <div className="bg-purple-50 rounded-xl p-3 text-center">
          <span className="block text-xs text-purple-400 mb-1">completadas</span>
          <span className="text-lg font-bold text-purple-600">
            {tasks.filter(t => t.completed).length}
          </span>
        </div>
      </div>
    </div>
  )
}