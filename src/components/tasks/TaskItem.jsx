import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { PencilIcon, TrashIcon, HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TaskItem({ task, onTaskUpdated, favorites = [], toggleFavorite }) {
  const [loading, setLoading] = useState(false)
  const isFavorite = favorites.includes(task.id)

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

  const getDueDateStatus = () => {
    if (!task.due_date) return null
    const today = new Date()
    const due = new Date(task.due_date)
    const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return 'vencida'
    if (diffDays === 0) return 'hoy'
    if (diffDays <= 2) return 'proxima'
    return 'normal'
  }

  const dueDateStatus = getDueDateStatus()
  const dueDateClass = {
    vencida: 'border-l-4 border-red-500',
    hoy: 'border-l-4 border-orange-500',
    proxima: 'border-l-4 border-yellow-500',
    normal: ''
  }[dueDateStatus] || ''

  return (
    <div className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all ${dueDateClass}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={toggleComplete}
            disabled={loading}
            className="mt-1 h-5 w-5 text-indigo-600 rounded cursor-pointer"
          />
          
          <div className="flex-1">
            <h4 className={`text-base font-medium ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
              {task.title}
            </h4>
            
            {task.description && (
              <p className="text-sm text-gray-600 mt-1">
                {task.description}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-gray-500">
              {task.due_date && (
                <span className={`flex items-center gap-1 ${
                  dueDateStatus === 'vencida' ? 'text-red-600 font-medium' :
                  dueDateStatus === 'hoy' ? 'text-orange-600 font-medium' :
                  dueDateStatus === 'proxima' ? 'text-yellow-600 font-medium' :
                  'text-gray-500'
                }`}>
                  ⏰ {format(new Date(task.due_date), 'dd/MM/yyyy', { locale: es })}
                  {dueDateStatus === 'vencida' && ' (Vencida)'}
                  {dueDateStatus === 'hoy' && ' (Hoy)'}
                  {dueDateStatus === 'proxima' && ' (Pronto)'}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2 ml-4">
          {toggleFavorite && (
            <button
              onClick={() => toggleFavorite(task.id)}
              className="p-1 text-gray-400 hover:text-red-500"
            >
              {isFavorite ? 
                <HeartSolid className="h-5 w-5 text-red-500" /> : 
                <HeartOutline className="h-5 w-5" />
              }
            </button>
          )}
          <button
            onClick={deleteTask}
            className="p-1 text-gray-400 hover:text-red-500"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}