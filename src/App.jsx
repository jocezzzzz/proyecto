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

  useEffect(() => {
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
        <div className="bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando TaskFlow...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">✅</span>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">TaskFlow</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">{session.user.email}</span>
              <button
                onClick={() => supabase.auth.signOut()}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-sm"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Stats tasks={tasks} />
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Buscar tareas..."
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'pending' 
                  ? 'bg-yellow-500 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'completed' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              Completadas
            </button>
          </div>
        </div>

        <div className="mt-8">
          <TaskForm onTaskAdded={fetchTasks} userId={session.user.id} />
        </div>

        <div className="mt-8">
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