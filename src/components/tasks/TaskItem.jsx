import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { TrashIcon, HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TaskItem({ task, onTaskUpdated, favorites = [], toggleFavorite, categories = [] }) {
  const [loading, setLoading] = useState(false)
  const isFavorite = favorites.includes(task.id)
  
  const category = categories.find(c => c.id === task.category_id)

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
    if (!confirm('¿Eliminar?')) return
    setLoading(true)
    try {
      const { error } = await supabase.from('tasks').delete().eq('id', task.id)
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
    return 'normal'
  }

  const status = getDueDateStatus()
  const statusColor = {
    vencida: 'text-rose-500',
    hoy: 'text-amber-500',
    normal: 'text-indigo-400'
  }[status] || 'text-indigo-400'

  return (
    <div className={`group bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-indigo-100 hover:shadow-md transition-all mb-2 ${task.completed ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={toggleComplete}
            disabled={loading}
            className="mt-1 h-4 w-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-200"
          />
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {category && (
                <span 
                  className="w-2 h-2 rounded-full shadow-sm" 
                  style={{ backgroundColor: category.color }}
                  title={category.name}
                />
              )}
              <h4 className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                {task.title}
              </h4>
            </div>
            
            {task.description && (
              <p className="text-xs text-gray-400 mt-0.5 ml-4">{task.description}</p>
            )}

            {task.due_date && (
              <p className={`text-xs mt-1 ml-4 ${statusColor}`}>
                {format(new Date(task.due_date), 'dd MMM', { locale: es })}
                {status === 'vencida' && ' • vencida'}
                {status === 'hoy' && ' • hoy'}
              </p>
            )}
          </div>
        </div>

        <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {toggleFavorite && (
            <button onClick={() => toggleFavorite(task.id)} className="p-1 text-indigo-300 hover:text-rose-400 transition-colors">
              {isFavorite ? <HeartSolid className="h-4 w-4 text-rose-400" /> : <HeartOutline className="h-4 w-4" />}
            </button>
          )}
          <button onClick={deleteTask} className="p-1 text-indigo-300 hover:text-rose-400 transition-colors">
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}