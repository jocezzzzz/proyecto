import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/auth/Auth'
import Stats from './components/dashboard/Stats'
import TaskList from './components/tasks/TaskList'
import TaskForm from './components/tasks/TaskForm'

function App() {
  const [session, setSession] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    // Detectar preferencia del sistema para modo oscuro
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDarkMode(isDark)

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchTasks()
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchTasks()
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!session) return

    const subscription = supabase
      .channel('tasks_channel')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${session.user.id}` },
        () => fetchTasks()
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [session])

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTasks(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'pending' && task.completed) return false
    if (filter === 'completed' && !task.completed) return false
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      return task.title.toLowerCase().includes(term) || 
             (task.description?.toLowerCase().includes(term) || false)
    }
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg mx-4">
          <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">Cargando TaskFlow...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${darkMode ? 'dark' : ''}`}>
      {/* Navbar mejorado para móvil */}
      <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16">
            {/* Logo y título */}
            <div className="flex items-center space-x-2">
              <span className="text-xl sm:text-2xl">✅</span>
              <h1 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate max-w-[120px] sm:max-w-none">
                TaskFlow
              </h1>
            </div>

            {/* Versión móvil: botón de menú */}
            <div className="flex items-center space-x-2 sm:hidden">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                <span className="text-xl">☰</span>
              </button>
            </div>

            {/* Versión desktop */}
            <div className="hidden sm:flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate max-w-[200px]">
                {session.user.email}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="bg-red-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-red-600 transition-colors shadow-sm"
              >
                Salir
              </button>
            </div>
          </div>

          {/* Menú móvil desplegable */}
          {showMobileMenu && (
            <div className="sm:hidden py-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col space-y-3">
                <span className="text-sm text-gray-600 dark:text-gray-300 break-all">
                  {session.user.email}
                </span>
                <button
                  onClick={() => {
                    supabase.auth.signOut()
                    setShowMobileMenu(false)
                  }}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 w-full"
                >
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        {/* Stats - responsive grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          <Stats tasks={tasks} />
        </div>
        
        {/* Búsqueda y filtros - stack en móvil */}
        <div className="mt-4 sm:mt-6 lg:mt-8 space-y-3 sm:space-y-4">
          <div className="w-full">
            <input
              type="text"
              placeholder="Buscar tareas..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          
          {/* Filtros scrollables en móvil */}
          <div className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-1 sm:flex-none ${
                filter === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-1 sm:flex-none ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors flex-1 sm:flex-none ${
                filter === 'completed' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
              }`}
            >
              Completadas
            </button>
          </div>
        </div>

        {/* Formulario de tareas */}
        <div className="mt-4 sm:mt-6">
          <TaskForm onTaskAdded={fetchTasks} userId={session.user.id} />
        </div>

        {/* Lista de tareas */}
        <div className="mt-4 sm:mt-6">
          <TaskList 
            tasks={filteredTasks} 
            loading={false}
            onTaskUpdated={fetchTasks}
          />
        </div>
      </main>
    </div>
  )
}

export default App