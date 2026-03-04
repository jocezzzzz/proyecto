import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/auth/Auth'
import Stats from './components/dashboard/Stats'
import TaskList from './components/tasks/TaskList'
import TaskForm from './components/tasks/TaskForm'
import TaskCalendar from './components/calendar/TaskCalendar'
import CategoryManager from './components/categories/CategoryManager'
import PomodoroTimer from './components/Pomodoro/PomodoroTimer'
import ProgressBar from './components/dashboard/ProgressBar'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import 'react-datepicker/dist/react-datepicker.css'

function App() {
  const [session, setSession] = useState(null)
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('fecha')
  const [viewMode, setViewMode] = useState('lista')
  const [favorites, setFavorites] = useState([])
  const [frase, setFrase] = useState('')
  const [showCategories, setShowCategories] = useState(false)
  const [showPomodoro, setShowPomodoro] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Cargar categorías del usuario (sin crear por defecto)
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
      '🍅 tiempo de enfoque',
      'pomodoro + tareas = productividad',
      'hoy será un gran día',
      'pequeños pasos, grandes logros',
    ]
    setFrase(frasesArr[Math.floor(Math.random() * frasesArr.length)])
  }, [tasks.length])

  const navigateTo = (section) => {
    setShowCategories(section === 'categories')
    setShowPomodoro(section === 'pomodoro')
    setViewMode(section === 'calendar' ? 'calendario' : 'lista')
    setMobileMenuOpen(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-indigo-600 text-xs">◉</span>
            </div>
          </div>
          <p className="mt-4 text-sm text-indigo-400 animate-pulse">cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header - Versión móvil y desktop */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur-md border-b border-indigo-100/50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            {/* Logo y título - siempre visible */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white text-lg">◉</span>
              </div>
              <h1 className="text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                taskflow
              </h1>
            </div>

            {/* Navegación desktop - visible en sm y arriba */}
            <div className="hidden sm:flex items-center space-x-2">
              <button
                onClick={() => {
                  setShowCategories(false)
                  setShowPomodoro(false)
                  setViewMode('lista')
                }}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  !showCategories && !showPomodoro && viewMode === 'lista'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                tareas
              </button>
              <button
                onClick={() => {
                  setShowCategories(false)
                  setShowPomodoro(false)
                  setViewMode('calendario')
                }}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  viewMode === 'calendario'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                calendario
              </button>
              <button
                onClick={() => {
                  setShowCategories(true)
                  setShowPomodoro(false)
                }}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  showCategories 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                categorías
              </button>
              <button
                onClick={() => {
                  setShowPomodoro(true)
                  setShowCategories(false)
                }}
                className={`px-4 py-1.5 rounded-full transition-all duration-200 ${
                  showPomodoro 
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-white/50'
                }`}
              >
                🍅 pomodoro
              </button>
            </div>

            {/* User menu y botón hamburguesa */}
            <div className="flex items-center space-x-3">
              {/* Email - visible en desktop */}
              <div className="hidden sm:flex items-center space-x-2 bg-white/50 px-3 py-1.5 rounded-full">
                <span className="text-xs text-indigo-600 font-medium">{session.user.email}</span>
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-xs">
                  {session.user.email[0].toUpperCase()}
                </div>
              </div>
              
              {/* Botón salir - visible en desktop */}
              <button
                onClick={() => supabase.auth.signOut()}
                className="hidden sm:block text-xs text-gray-400 hover:text-indigo-600 transition-colors bg-white/50 px-3 py-1.5 rounded-full"
              >
                salir
              </button>

              {/* Botón hamburguesa - visible en móvil */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>

          {/* Menú móvil desplegable */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-4 pb-2 animate-fadeIn">
              <div className="bg-white/90 backdrop-blur-sm rounded-xl border border-indigo-100 shadow-lg overflow-hidden">
                {/* Información del usuario */}
                <div className="p-4 border-b border-indigo-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {session.user.email[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-indigo-600 font-medium truncate">{session.user.email}</p>
                      <p className="text-xs text-indigo-400">usuario</p>
                    </div>
                  </div>
                </div>

                {/* Opciones de navegación */}
                <nav className="p-2">
                  <button
                    onClick={() => {
                      setShowCategories(false)
                      setShowPomodoro(false)
                      setViewMode('lista')
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      !showCategories && !showPomodoro && viewMode === 'lista'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                        : 'text-gray-600 hover:bg-indigo-50'
                    }`}
                  >
                    <span className="text-lg">📋</span>
                    <span className="text-sm font-medium">tareas</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowCategories(false)
                      setShowPomodoro(false)
                      setViewMode('calendario')
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      viewMode === 'calendario'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                        : 'text-gray-600 hover:bg-indigo-50'
                    }`}
                  >
                    <span className="text-lg">📅</span>
                    <span className="text-sm font-medium">calendario</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowCategories(true)
                      setShowPomodoro(false)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      showCategories 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                        : 'text-gray-600 hover:bg-indigo-50'
                    }`}
                  >
                    <span className="text-lg">🏷️</span>
                    <span className="text-sm font-medium">categorías</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowPomodoro(true)
                      setShowCategories(false)
                      setMobileMenuOpen(false)
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center gap-3 ${
                      showPomodoro 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                        : 'text-gray-600 hover:bg-indigo-50'
                    }`}
                  >
                    <span className="text-lg">🍅</span>
                    <span className="text-sm font-medium">pomodoro</span>
                  </button>
                </nav>

                {/* Botón salir en móvil */}
                <div className="p-2 border-t border-indigo-100">
                  <button
                    onClick={() => supabase.auth.signOut()}
                    className="w-full text-left px-4 py-3 rounded-lg text-gray-600 hover:bg-rose-50 transition-colors flex items-center gap-3"
                  >
                    <span className="text-lg">🚪</span>
                    <span className="text-sm font-medium">salir</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {showCategories ? (
          <CategoryManager 
            categories={categories}
            setCategories={setCategories}
            userId={session.user.id}
          />
        ) : showPomodoro ? (
          <div className="max-w-md mx-auto">
            <PomodoroTimer />
          </div>
        ) : (
          <>
            {/* Frase con diseño */}
            {frase && (
              <div className="text-center mb-8">
                <div className="inline-block bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full shadow-sm">
                  <p className="text-xs text-indigo-600 italic">{frase}</p>
                </div>
              </div>
            )}
            
            {/* Stats y Barra de progreso */}
            <div className="space-y-6 mb-8">
              <Stats tasks={tasks} />
              <ProgressBar tasks={tasks} />
            </div>

            {/* Botón pomodoro con estilo - visible solo en desktop */}
            <div className="hidden sm:block mb-4">
              <button
                onClick={() => setShowPomodoro(true)}
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span>🍅</span>
                <span>iniciar pomodoro</span>
              </button>
            </div>

            {/* Barra de herramientas con diseño mejorado */}
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 shadow-sm mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex gap-1 bg-white rounded-lg p-0.5 shadow-sm">
                  <button
                    onClick={() => setViewMode('lista')}
                    className={`px-3 py-1.5 text-xs rounded-md transition-all duration-200 ${
                      viewMode === 'lista' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-500 hover:text-indigo-600'
                    }`}
                  >
                    lista
                  </button>
                  <button
                    onClick={() => setViewMode('calendario')}
                    className={`px-3 py-1.5 text-xs rounded-md transition-all duration-200 ${
                      viewMode === 'calendario' 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' 
                        : 'text-gray-500 hover:text-indigo-600'
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
                      className="px-3 py-1.5 text-xs border border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
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
                      className="flex-1 sm:w-48 px-3 py-1.5 text-xs border border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                    />
                    
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-1.5 text-xs border border-indigo-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200 bg-white"
                    >
                      <option value="fecha">fecha</option>
                      <option value="fecha_vencimiento">límite</option>
                      <option value="alfabetico">a-z</option>
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Formulario */}
            <div className="mb-8">
              <TaskForm 
                onTaskAdded={fetchTasks} 
                userId={session.user.id}
                categories={categories}
              />
            </div>

            {/* Contenido */}
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

      {/* Agregar estilos para animación */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default App