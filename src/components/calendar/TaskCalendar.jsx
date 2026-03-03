import { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import { supabase } from '../../lib/supabase'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function TaskCalendar({ tasks, categories = [], onTaskUpdated }) {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const tasksForDate = tasks.filter(task => {
    if (!task.due_date) return false
    return new Date(task.due_date).toDateString() === selectedDate.toDateString()
  })

  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null

    const dayTasks = tasks.filter(task => {
      if (!task.due_date) return false
      return new Date(task.due_date).toDateString() === date.toDateString()
    })

    if (dayTasks.length === 0) return null

    // Mostrar hasta 3 puntos de colores
    const displayTasks = dayTasks.slice(0, 3)
    
    return (
      <div className="flex justify-center gap-0.5 mt-1">
        {displayTasks.map((task, i) => {
          const category = categories.find(c => c.id === task.category_id)
          return (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: category?.color || '#9CA3AF' }}
              title={task.title}
            />
          )
        })}
        {dayTasks.length > 3 && (
          <span className="text-[8px] text-gray-400">+{dayTasks.length - 3}</span>
        )}
      </div>
    )
  }

  const toggleComplete = async (taskId, currentStatus) => {
    await supabase
      .from('tasks')
      .update({ completed: !currentStatus })
      .eq('id', taskId)
    onTaskUpdated()
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-1">
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            locale="es"
            className="border-0 w-full"
          />
        </div>

        {/* Tareas del día */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </h3>

          {tasksForDate.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              no hay tareas para este día
            </p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {tasksForDate.map(task => {
                const category = categories.find(c => c.id === task.category_id)
                return (
                  <div
                    key={task.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleComplete(task.id, task.completed)}
                        className="mt-1 h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {category && (
                            <span 
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          <h4 className={`text-sm ${task.completed ? 'line-through text-gray-300' : 'text-gray-700'}`}>
                            {task.title}
                          </h4>
                        </div>
                        {task.description && (
                          <p className="text-xs text-gray-400 mt-1 ml-4">{task.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}