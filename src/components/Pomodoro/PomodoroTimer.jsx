import { useState, useEffect, useRef } from 'react'
import { PlayIcon, PauseIcon, ArrowPathIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

export default function PomodoroTimer() {
  // Estados del timer
  const [mode, setMode] = useState('pomodoro') // 'pomodoro', 'shortBreak', 'longBreak'
  const [isActive, setIsActive] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [showSettings, setShowSettings] = useState(false)
  
  // Configuraciones personalizables
  const [settings, setSettings] = useState({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4
  })

  // Contador de pomodoros completados
  const [completedPomodoros, setCompletedPomodoros] = useState(0)

  const audioRef = useRef(null)

  // Cargar configuración guardada
  useEffect(() => {
    const saved = localStorage.getItem('pomodoroSettings')
    if (saved) {
      setSettings(JSON.parse(saved))
    }
  }, [])

  // Guardar configuración
  useEffect(() => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings))
  }, [settings])

  // Actualizar segundos cuando cambia el modo
  useEffect(() => {
    const minutes = 
      mode === 'pomodoro' ? settings.pomodoro :
      mode === 'shortBreak' ? settings.shortBreak :
      settings.longBreak
    setSecondsLeft(minutes * 60)
  }, [mode, settings])

  // Timer principal
  useEffect(() => {
    let interval = null
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(seconds => seconds - 1)
      }, 1000)
    } else if (secondsLeft === 0) {
      // Timer terminado
      if (mode === 'pomodoro') {
        setCompletedPomodoros(prev => prev + 1)
        
        // Decidir siguiente descanso
        if ((completedPomodoros + 1) % settings.longBreakInterval === 0) {
          setMode('longBreak')
        } else {
          setMode('shortBreak')
        }
      } else {
        setMode('pomodoro')
      }
      
      // Reproducir sonido
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio error:', e))
      }
      
      setIsActive(false)
    }
    return () => clearInterval(interval)
  }, [isActive, secondsLeft, mode, completedPomodoros, settings])

  const toggleTimer = () => setIsActive(!isActive)
  
  const resetTimer = () => {
    setIsActive(false)
    const minutes = 
      mode === 'pomodoro' ? settings.pomodoro :
      mode === 'shortBreak' ? settings.shortBreak :
      settings.longBreak
    setSecondsLeft(minutes * 60)
  }

  const formatTime = () => {
    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = () => {
    const totalMinutes = 
      mode === 'pomodoro' ? settings.pomodoro :
      mode === 'shortBreak' ? settings.shortBreak :
      settings.longBreak
    return ((totalMinutes * 60 - secondsLeft) / (totalMinutes * 60)) * 100
  }

  const modeColors = {
    pomodoro: '#4B5563',    // gray-600
    shortBreak: '#10B981',   // emerald-500
    longBreak: '#6366F1'     // indigo-500
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <audio ref={audioRef} src="https://actions.google.com/sounds/v1/alarms/beep_short.ogg" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <span>🍅 pomodoro</span>
          <span className="text-gray-300">·</span>
          <span className="text-gray-400">{completedPomodoros} completados</span>
        </h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Cog6ToothIcon className="h-4 w-4" />
        </button>
      </div>

      {showSettings ? (
        /* Panel de configuración */
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">pomodoro</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.pomodoro}
                onChange={(e) => setSettings({...settings, pomodoro: parseInt(e.target.value) || 25})}
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">descanso corto</label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.shortBreak}
                onChange={(e) => setSettings({...settings, shortBreak: parseInt(e.target.value) || 5})}
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">descanso largo</label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.longBreak}
                onChange={(e) => setSettings({...settings, longBreak: parseInt(e.target.value) || 15})}
                className="w-full px-2 py-1 text-sm border border-gray-200 rounded-md"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">intervalo para descanso largo</label>
            <input
              type="number"
              min="2"
              max="10"
              value={settings.longBreakInterval}
              onChange={(e) => setSettings({...settings, longBreakInterval: parseInt(e.target.value) || 4})}
              className="w-full px-2 py-1 text-sm border border-gray-200 rounded-md"
            />
          </div>
          <button
            onClick={() => setShowSettings(false)}
            className="w-full py-2 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-900"
          >
            guardar
          </button>
        </div>
      ) : (
        /* Timer principal */
        <>
          {/* Selector de modo */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setMode('pomodoro')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                mode === 'pomodoro' 
                  ? 'bg-gray-800 text-white' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              pomodoro
            </button>
            <button
              onClick={() => setMode('shortBreak')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                mode === 'shortBreak' 
                  ? 'bg-emerald-500 text-white' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              descanso
            </button>
            <button
              onClick={() => setMode('longBreak')}
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                mode === 'longBreak' 
                  ? 'bg-indigo-500 text-white' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              largo
            </button>
          </div>

          {/* Timer circular */}
          <div className="w-48 h-48 mx-auto mb-6">
            <CircularProgressbar
              value={progress()}
              text={formatTime()}
              styles={buildStyles({
                textSize: '20px',
                textColor: '#4B5563',
                pathColor: modeColors[mode],
                trailColor: '#E5E7EB'
              })}
            />
          </div>

          {/* Controles */}
          <div className="flex justify-center gap-3">
            <button
              onClick={toggleTimer}
              className="p-3 bg-gray-800 text-white rounded-full hover:bg-gray-900 transition-colors"
            >
              {isActive ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
            </button>
            <button
              onClick={resetTimer}
              className="p-3 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              <ArrowPathIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Mensaje según modo */}
          <p className="text-center text-xs text-gray-400 mt-4">
            {mode === 'pomodoro' 
              ? '🎯 tiempo de enfoque' 
              : mode === 'shortBreak' 
              ? '☕ descanso breve' 
              : '🌿 descanso largo'}
          </p>
        </>
      )}
    </div>
  )
}