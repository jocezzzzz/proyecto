import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function TaskItem({ task, onTaskUpdated, editingTask, setEditingTask }) {
  const [loading, setLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    title: task.title,
    description: task.description || ''
  })

  const isEditing = editingTask === task.id

  const toggleComplete = async () => {
    setLoading(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !task.completed })
        .eq('id', task.id)

      if (error) throw error
      onTaskUpdated()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async () => {
    if (!confirm('¿Eliminar esta tarea?')) return
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', task.id)

      if (error) throw error
      onTaskUpdated()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateTask = async () => {
    if (!editForm.title.trim()) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .update({
          title: editForm.title.trim(),
          description: editForm.description.trim()
        })
        .eq('id', task.id)

      if (error) throw error
      setEditingTask(null)
      onTaskUpdated()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 border-2 border-indigo-200">
        <div className="space-y-3">
          <input
            type="text"
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Título de la tarea"
            autoFocus
          />
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            rows={2}
            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Descripción (opcional)"
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setEditingTask(null)}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={updateTask}
              disabled={loading}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white dark:bg-gray-800 shadow-sm rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
      task.completed ? 'opacity-75 border-l-4 border-green-500' : 'border-l-4 border-indigo-500'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={toggleComplete}
            disabled={loading}
            className="mt-1 h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
          />
          <div className="flex-1">
            <h4 className={`text-lg font-medium ${
              task.completed 
                ? 'line-through text-gray-500 dark:text-gray-400' 
                : 'text-gray-900 dark:text-white'
            }`}>
              {task.title}
            </h4>
            {task.description && (
              <p className={`mt-1 text-sm ${
                task.completed 
                  ? 'text-gray-400 dark:text-gray-500' 
                  : 'text-gray-600 dark:text-gray-300'
              }`}>
                {task.description}
              </p>
            )}
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              {new Date(task.created_at).toLocaleDateString('es', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => setEditingTask(task.id)}
            className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Editar"
          >
            <PencilIcon className="h-5 w-5" />
          </button>
          <button
            onClick={deleteTask}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Eliminar"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}