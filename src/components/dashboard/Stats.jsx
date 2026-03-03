export default function Stats({ tasks }) {
  const total = tasks.length
  const completed = tasks.filter(t => t.completed).length
  const pending = total - completed
  const streak = Math.floor(completed / 2) + 1

  const stats = [
    { label: 'total', value: total },
    { label: 'completadas', value: completed },
    { label: 'pendientes', value: pending },
    { label: 'racha', value: streak }
  ]

  return (
    <div className="grid grid-cols-4 gap-2">
      {stats.map((stat, i) => (
        <div key={i} className="text-center">
          <div className="text-lg font-light text-gray-700">{stat.value}</div>
          <div className="text-xs text-gray-400">{stat.label}</div>
        </div>
      ))}
    </div>
  )
}