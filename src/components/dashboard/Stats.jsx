export default function Stats({ tasks }) {
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const pending = total - completed
  const streak = Math.floor(completed / 2) + 1

  const stats = [
    { label: 'total', value: total, color: 'from-indigo-400 to-indigo-600' },
    { label: 'completadas', value: completed, color: 'from-emerald-400 to-emerald-600' },
    { label: 'pendientes', value: pending, color: 'from-amber-400 to-amber-600' },
    { label: 'racha', value: streak, color: 'from-rose-400 to-rose-600' }
  ]

  return (
    <div className="grid grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-indigo-100 hover:shadow-md transition-all"
        >
          <div className={`text-2xl font-light bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-1`}>
            {stat.value}
          </div>
          <div className="text-xs text-indigo-400">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}