import { useState } from 'react'
import TaskItem from './TaskItem'

export default function TaskList({ tasks, loading, onTaskUpdated }) {
  const [editingTask, setEditingTask] = useState(null)

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Cargando tareas...</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
        <span className="text-6xl mb-4 block">📋</span>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No hay tareas
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          ¡Comienza agregando una nueva tarea!
        </p>
      </div>
    )
  }

  const pendingTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <div className="space-y-6">
      {pendingTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Pendientes ({pendingTasks.length})
          </h3>
          <div className="space-y-3">
            {pendingTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onTaskUpdated={onTaskUpdated}
                editingTask={editingTask}
                setEditingTask={setEditingTask}
              />
            ))}
          </div>
        </div>
      )}

      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            Completadas ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.map(task => (
              <TaskItem
                key={task.id}
                task={task}
                onTaskUpdated={onTaskUpdated}
                editingTask={editingTask}
                setEditingTask={setEditingTask}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}