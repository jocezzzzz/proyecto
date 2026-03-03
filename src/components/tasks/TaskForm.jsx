import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import DatePicker from 'react-datepicker'
import "react-datepicker/dist/react-datepicker.css"

export default function TaskForm({ onTaskAdded, userId }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(null)
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
          due_date: dueDate
        }])

      if (error) throw error

      setTitle('')
      setDescription('')
      setDueDate(null)
      onTaskAdded()
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 mb-4">📝 Nueva tarea</h3>
      
      <div className="space-y-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="¿Qué necesitas hacer?"
          required
        />

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
          placeholder="Descripción (opcional)"
        />

        <div>
          <label className="block text-sm text-gray-600 mb-1">📅 Fecha límite (opcional)</label>
          <DatePicker
            selected={dueDate}
            onChange={(date) => setDueDate(date)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
            placeholderText="Selecciona una fecha"
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            isClearable
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Agregando...' : '+ Agregar tarea'}
        </button>
      </div>
    </form>
  )
}