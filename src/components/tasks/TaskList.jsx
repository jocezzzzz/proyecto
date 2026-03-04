import TaskItem from './TaskItem'

export default function TaskList({ tasks, loading, onTaskUpdated, favorites, toggleFavorite, categories }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-200 border-t-indigo-600"></div>
        <p className="text-xs text-indigo-400 mt-2">cargando...</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-xl border border-indigo-100">
        <div className="text-4xl mb-3">✨</div>
        <p className="text-xs text-indigo-400">no hay tareas</p>
        <p className="text-xs text-indigo-300 mt-1">crea una para empezar</p>
      </div>
    )
  }

  const pendingTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <div className="space-y-6">
      {pendingTasks.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full"></span>
            pendientes · {pendingTasks.length}
          </h3>
          <div>
            {pendingTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onTaskUpdated={onTaskUpdated}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                categories={categories}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-indigo-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-emerald-400 to-emerald-500 rounded-full"></span>
            completadas · {completedTasks.length}
          </h3>
          <div>
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onTaskUpdated={onTaskUpdated}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                categories={categories}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}