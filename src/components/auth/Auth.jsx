import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const [message, setMessage] = useState('')

  const handleAuth = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, password, 
          options: { emailRedirectTo: window.location.origin }
        })
        if (error) throw error
        setMessage('revisa tu email')
      }
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-6">
        <h2 className="text-sm font-medium text-gray-600 text-center mb-6">
          {isLogin ? 'acceso' : 'registro'}
        </h2>

        <form onSubmit={handleAuth} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
            placeholder="email"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-300"
            placeholder="contraseña"
            minLength={6}
          />

          {message && (
            <p className="text-xs text-center text-gray-400">{message}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-900 disabled:opacity-50 transition-colors"
          >
            {loading ? '...' : (isLogin ? 'entrar' : 'crear cuenta')}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-gray-50 text-gray-400">o</span>
          </div>
        </div>

        <button
          onClick={() => supabase.auth.signInWithOAuth({ provider: 'google' })}
          className="w-full py-2 border border-gray-200 text-sm text-gray-600 rounded-md hover:bg-white transition-colors"
        >
          google
        </button>

        <p className="text-xs text-center text-gray-400 mt-6">
          {isLogin ? 'nuevo usuario? ' : 'ya tienes cuenta? '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-gray-600 hover:underline"
          >
            {isLogin ? 'regístrate' : 'accede'}
          </button>
        </p>
      </div>
    </div>
  )
}