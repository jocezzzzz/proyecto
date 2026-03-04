import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

export default function TaskForm({ onTaskAdded, userId, categories = [] }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(null)
  const [categoryId, setCategoryId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !userId) return

    setLoading(true)
    try {
      const { error } = await supabase
        .from('tasks')
        .insert([{
          title: title.trim(),
          description: description.trim() || null,
          user_id: userId,
          completed: false,
          due_date: dueDate,
          category_id: categoryId || null
        }])

      if (error) throw error

      setTitle('')
      setDescription('')
      setDueDate(null)
      setCategoryId('')
      onTaskAdded()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-indigo-100">
      <h3 className="text-xs font-medium text-indigo-600 uppercase tracking-wider mb-4 flex items-center gap-2">
        <span className="w-1 h-4 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></span>
        nueva tarea
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white/50"
          placeholder="título"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-2 text-sm border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white/50"
          placeholder="descripción (opcional)"
        />

        <div className="grid grid-cols-2 gap-3">
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            className="w-full px-4 py-2 text-sm border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white/50"
            placeholderText="fecha límite"
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            isClearable
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-4 py-2 text-sm border border-indigo-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white/50"
          >
            <option value="">sin categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50"
        >
          {loading ? '...' : 'crear tarea'}
        </button>
      </form>
    </div>
  )
}