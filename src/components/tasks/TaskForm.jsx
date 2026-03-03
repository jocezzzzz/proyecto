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
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">nueva tarea</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
          placeholder="título"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
          placeholder="descripción (opcional)"
        />

        <div className="grid grid-cols-2 gap-2">
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
            placeholderText="fecha límite"
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            isClearable
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
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
          className="w-full py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-900 disabled:opacity-50 transition-colors"
        >
          {loading ? '...' : 'crear tarea'}
        </button>
      </form>
    </div>
  )
}