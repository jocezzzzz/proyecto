import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { SketchPicker } from 'react-color'

export default function CategoryManager({ categories, setCategories, userId }) {
  const [editing, setEditing] = useState(null)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#3B82F6')
  const [showPicker, setShowPicker] = useState(false)

  const createCategory = async () => {
    if (!newName.trim()) return

    const { data, error } = await supabase
      .from('categories')
      .insert([{
        name: newName.trim(),
        color: newColor,
        user_id: userId
      }])
      .select()

    if (!error && data) {
      setCategories([...categories, data[0]])
      setNewName('')
      setNewColor('#3B82F6')
    }
  }

  const updateCategory = async (id, updates) => {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()

    if (!error && data) {
      setCategories(categories.map(c => c.id === id ? data[0] : c))
      setEditing(null)
    }
  }

  const deleteCategory = async (id) => {
    if (!confirm('¿Eliminar categoría? Las tareas quedarán sin categoría.')) return
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (!error) {
      setCategories(categories.filter(c => c.id !== id))
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-sm font-medium text-gray-700 mb-4">categorías</h2>

      {/* Mensaje si no hay categorías */}
      {categories.length === 0 && (
        <div className="bg-gray-50 rounded-lg p-6 text-center mb-6">
          <p className="text-xs text-gray-400">no tienes categorías</p>
          <p className="text-xs text-gray-300 mt-1">crea una para organizar tus tareas</p>
        </div>
      )}

      {/* Crear nueva */}
      <div className="bg-white rounded-lg p-4 border border-gray-200 mb-6">
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="nombre de la categoría"
            className="flex-1 px-3 py-1 text-sm border border-gray-200 rounded-md"
          />
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-8 h-8 rounded-md border border-gray-200"
            style={{ backgroundColor: newColor }}
          />
        </div>

        {showPicker && (
          <div className="mb-3">
            <SketchPicker
              color={newColor}
              onChange={(color) => setNewColor(color.hex)}
            />
          </div>
        )}

        <button
          onClick={createCategory}
          className="w-full py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-900"
        >
          crear categoría
        </button>
      </div>

      {/* Lista de categorías */}
      <div className="space-y-2">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white rounded-lg p-3 border border-gray-200 flex items-center justify-between">
            {editing === cat.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm border rounded-md"
                />
                <button
                  onClick={() => setShowPicker(!showPicker)}
                  className="w-6 h-6 rounded-md border"
                  style={{ backgroundColor: newColor }}
                />
                <button
                  onClick={() => updateCategory(cat.id, { name: newName, color: newColor })}
                  className="px-3 py-1 bg-gray-800 text-white text-xs rounded-md"
                >
                  ok
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-sm text-gray-700">{cat.name}</span>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => {
                      setEditing(cat.id)
                      setNewName(cat.name)
                      setNewColor(cat.color)
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 px-2"
                  >
                    editar
                  </button>
                  <button
                    onClick={() => deleteCategory(cat.id)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    eliminar
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}