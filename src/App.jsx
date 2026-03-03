import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/auth/Auth'
import Stats from './components/dashboard/Stats'
import TaskList from './components/tasks/TaskList'
import TaskForm from './components/tasks/TaskForm'
import 'react-datepicker/dist/react-datepicker.css'

function App() {
  const [session, setSession] = useState(null)
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [sortBy, setSortBy] = useState('fecha')
  const [favorites, setFavorites] = useState([])
  const [frase, setFrase] = useState('')

  useEffect(() => {
    async function initializeApp() {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Sesión obtenida:', session)
      setSession(session)
      
      if (session?.user) {
        await fetchTasksWithSession(session)
      }
      setLoading(false)
    }

    initializeApp()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('Cambio en auth:', _event, session)
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
    if (!session?.user?.id) {
      console.log('No hay sesión válida')
      return
    }

    try {
      console.log('Cargando tareas para:', session.user.id)
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
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks', 
          filter: `user_id=eq.${session.user.id}` 
        },
        () => fetchTasks()
      )
      .subscribe()

    return () => subscription.unsubscribe()
  }, [session?.user?.id])

  // Filtrado y ordenamiento
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
      '✨ ¡Cada tarea completada es un paso más!',
      '💪 Tú puedes con todo',
      '🎯 Enfoque y disciplina',
      '🌟 Hoy será un gran día',
      '⚡ La constancia es la clave',
    ]
    setFrase(frasesArr[Math.floor(Math.random() * frasesArr.length)])
  }, [tasks.length])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="bg-white p-6 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando TaskFlow...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✅</span>
              <h1 className="text-xl font-bold text-gray-900">TaskFlow</h1>
            </div>
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {session?.user?.email || 'Usuario'}
              </span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {frase && (
          <div className="mb-4 text-center text-sm italic text-gray-600 bg-white p-3 rounded-lg shadow-sm">
            {frase}
          </div>
        )}
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Stats tasks={tasks} />
        </div>

        <div className="flex flex-col sm:flex-row justify-between gap-3 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                filter === 'completed' ? 'bg-green-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              Completadas
            </button>
          </div>

          <input
            type="text"
            placeholder="🔍 Buscar tareas..."
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-3 py-1.5 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 mb-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-lg"
          >
            <option value="fecha">📅 Fecha creación</option>
            <option value="fecha_vencimiento">⏰ Fecha límite</option>
            <option value="alfabetico">🔤 Alfabético</option>
          </select>
        </div>

        <div className="mb-6">
          <TaskForm onTaskAdded={fetchTasks} userId={session?.user?.id} />
        </div>

        <TaskList 
          tasks={sortedTasks} 
          loading={false}
          onTaskUpdated={fetchTasks}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      </main>
    </div>
  )
}

export default App