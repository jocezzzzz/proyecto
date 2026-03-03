import TaskItem from './TaskItem'

export default function TaskList({ tasks, loading, onTaskUpdated, favorites, toggleFavorite, categories }) {
  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-xs text-gray-400">cargando...</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-xs text-gray-400">no hay tareas</p>
        <p className="text-xs text-gray-300 mt-1">crea una para empezar</p>
      </div>
    )
  }

  const pendingTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <div className="space-y-4">
      {pendingTasks.length > 0 && (
        <div>
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
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
        <div className="pt-2">
          <h3 className="text-xs font-medium text-gray-300 uppercase tracking-wider mb-2">
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