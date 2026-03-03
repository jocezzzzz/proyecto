import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/auth/Auth'
import Stats from './components/dashboard/Stats'
import TaskList from './components/tasks/TaskList'
import TaskForm from './components/tasks/TaskForm'
import TaskCalendar from './components/calendar/TaskCalendar'
import CategoryManager from './components/categories/CategoryManager'
import 'react-datepicker/dist/react-datepicker.css'

function App() {
  const [session, setSession] = useState(null)
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('fecha')
  const [viewMode, setViewMode] = useState('lista') // 'lista' o 'calendario'
  const [favorites, setFavorites] = useState([])
  const [frase, setFrase] = useState('')
  const [showCategories, setShowCategories] = useState(false)

  // Cargar categorías del usuario
  useEffect(() => {
    const loadCategories = async () => {
      if (!session?.user?.id) return
      
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', session.user.id)
        .order('name')

      if (!error) setCategories(data || [])
    }
    loadCategories()
  }, [session])

  // Si no hay categorías, crear algunas por defecto
  useEffect(() => {
    const createDefaultCategories = async () => {
      if (!session?.user?.id || categories.length > 0) return

      const defaultCategories = [
        { name: 'Trabajo', color: '#3B82F6', user_id: session.user.id },
        { name: 'Personal', color: '#10B981', user_id: session.user.id },
        { name: 'Estudio', color: '#8B5CF6', user_id: session.user.id },
        { name: 'Hogar', color: '#F59E0B', user_id: session.user.id }
      ]

      const { data } = await supabase
        .from('categories')
        .insert(defaultCategories)
        .select()

      if (data) setCategories(data)
    }
    createDefaultCategories()
  }, [session, categories])

  useEffect(() => {
    async function initializeApp() {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      if (session?.user) await fetchTasksWithSession(session)
      setLoading(false)
    }

    initializeApp()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session?.user) {
        await fetchTasksWithSession(session)
      } else {
        setTasks([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchTasksWithSession = async (session) => {
    if (!session?.user?.id) return
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          categories (
            id,
            name,
            color
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const fetchTasks = async () => {
    if (!session?.user?.id) return
    await fetchTasksWithSession(session)
  }

  // Suscripción en tiempo real
  useEffect(() => {
    if (!session?.user?.id) return
    const subscription = supabase
      .channel('tasks_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${session.user.id}` },
        () => fetchTasks()
      )
      .subscribe()
    return () => subscription.unsubscribe()
  }, [session?.user?.id])

  // Filtrado
  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending' && task.completed) return false
    if (filter === 'completed' && !task.completed) return false
    if (filter.startsWith('cat_')) {
      const catId = parseInt(filter.replace('cat_', ''))
      return task.category_id === catId
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return task.title.toLowerCase().includes(term) || 
             (task.description?.toLowerCase().includes(term) || false)
    }
    return true
  })

  // Ordenamiento
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (sortBy === 'alfabetico') return a.title.localeCompare(b.title)
    if (sortBy === 'fecha_vencimiento') {
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return new Date(a.due_date) - new Date(b.due_date)
    }
    return new Date(b.created_at) - new Date(a.created_at)
  })

  useEffect(() => {
    const saved = localStorage.getItem('favorites')
    if (saved) setFavorites(JSON.parse(saved))
  }, [])

  const toggleFavorite = (taskId) => {
    const newFavorites = favorites.includes(taskId)
      ? favorites.filter(id => id !== taskId)
      : [...favorites, taskId]
    setFavorites(newFavorites)
    localStorage.setItem('favorites', JSON.stringify(newFavorites))
  }

  useEffect(() => {
    const frasesArr = [
      'organiza con color',
      'cada tarea en su lugar',
      'colores que inspiran',
      'tu vida en categorías',
      'pinta tus tareas',
    ]
    setFrase(frasesArr[Math.floor(Math.random() * frasesArr.length)])
  }, [tasks.length])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-400">cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600 text-xl">◉</span>
                <h1 className="text-sm font-medium text-gray-700 tracking-wide">taskflow</h1>
              </div>
              <button
                onClick={() => setShowCategories(!showCategories)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showCategories ? '← tareas' : 'categorías'}
              </button>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-400">{session.user.email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {showCategories ? (
          <CategoryManager 
            categories={categories}
            setCategories={setCategories}
            userId={session.user.id}
          />
        ) : (
          <>
            {/* Frase */}
            {frase && (
              <div className="text-center mb-8">
                <p className="text-xs text-gray-400 italic">{frase}</p>
              </div>
            )}
            
            {/* Stats */}
            <div className="mb-8">
              <Stats tasks={tasks} />
            </div>

            {/* Barra de herramientas */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex gap-1 bg-white rounded-lg p-0.5 border border-gray-200">
                <button
                  onClick={() => setViewMode('lista')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    viewMode === 'lista' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  lista
                </button>
                <button
                  onClick={() => setViewMode('calendario')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    viewMode === 'calendario' ? 'bg-gray-800 text-white' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  calendario
                </button>
              </div>

              {viewMode === 'lista' && (
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                  >
                    <option value="all">todas</option>
                    <option value="pending">pendientes</option>
                    <option value="completed">completadas</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={`cat_${cat.id}`}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="text"
                    placeholder="buscar..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 sm:w-48 px-3 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                  />
                  
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
                  >
                    <option value="fecha">fecha</option>
                    <option value="fecha_vencimiento">límite</option>
                    <option value="alfabetico">a-z</option>
                  </select>
                </div>
              )}
            </div>

            {/* Formulario */}
            <div className="mb-8">
              <TaskForm 
                onTaskAdded={fetchTasks} 
                userId={session.user.id}
                categories={categories}
              />
            </div>

            {/* Contenido: Lista o Calendario */}
            {viewMode === 'lista' ? (
              <TaskList 
                tasks={sortedTasks} 
                loading={false}
                onTaskUpdated={fetchTasks}
                favorites={favorites}
                toggleFavorite={toggleFavorite}
                categories={categories}
              />
            ) : (
              <TaskCalendar 
                tasks={tasks}
                categories={categories}
                onTaskUpdated={fetchTasks}
              />
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App