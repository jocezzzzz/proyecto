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

    const displayTasks = dayTasks.slice(0, 3)
    
    return (
      <div className="flex justify-center gap-0.5 mt-1">
        {displayTasks.map((task, i) => {
          const category = categories.find(c => c.id === task.category_id)
          return (
            <span
              key={i}
              className="h-1.5 w-1.5 rounded-full shadow-sm"
              style={{ backgroundColor: category?.color || '#9CA3AF' }}
              title={task.title}
            />
          )
        })}
        {dayTasks.length > 3 && (
          <span className="text-[8px] text-indigo-400">+{dayTasks.length - 3}</span>
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
    <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-indigo-100 p-6 shadow-sm">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendario */}
        <div className="lg:col-span-1">
          <style jsx global>{`
            .react-calendar {
              border: none !important;
              background: transparent !important;
              font-family: inherit !important;
              width: 100% !important;
            }
            .react-calendar__navigation button {
              color: #4f46e5 !important;
              font-size: 0.875rem !important;
            }
            .react-calendar__tile {
              padding: 0.75em 0.5em !important;
              border-radius: 0.5rem !important;
            }
            .react-calendar__tile:enabled:hover,
            .react-calendar__tile:enabled:focus {
              background-color: #e0e7ff !important;
            }
            .react-calendar__tile--active {
              background: linear-gradient(135deg, #4f46e5 0%, #9333ea 100%) !important;
              color: white !important;
            }
            .react-calendar__tile--active:enabled:hover,
            .react-calendar__tile--active:enabled:focus {
              background: linear-gradient(135deg, #4338ca 0%, #7e22ce 100%) !important;
            }
          `}</style>
          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            tileContent={tileContent}
            locale="es"
          />
        </div>

        {/* Tareas del día */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-medium text-indigo-600 mb-4 flex items-center gap-2">
            <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
          </h3>

          {tasksForDate.length === 0 ? (
            <div className="text-center py-12 bg-indigo-50/50 rounded-xl">
              <p className="text-sm text-indigo-400">no hay tareas para este día</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
              {tasksForDate.map(task => {
                const category = categories.find(c => c.id === task.category_id)
                return (
                  <div
                    key={task.id}
                    className={`p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-indigo-100 hover:shadow-md transition-all ${
                      task.completed ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleComplete(task.id, task.completed)}
                        className="mt-1 h-4 w-4 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {category && (
                            <span 
                              className="w-2 h-2 rounded-full shadow-sm"
                              style={{ backgroundColor: category.color }}
                            />
                          )}
                          <h4 className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
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