interface StudentStat {
  id: string
  studentName: string
  studentEmail: string
  score: number
  completedAt: Date | null
  passed: boolean
}

interface StudentStatsProps {
  stats: StudentStat[]
}

export function StudentStats({ stats }: StudentStatsProps) {
  if (stats.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        Aucun élève n'a encore complété ce quiz.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Élève</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Score</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Résultat</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Date</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((stat) => (
            <tr key={stat.id} className="border-b hover:bg-gray-50">
              <td className="py-3 px-4">
                <p className="font-medium">{stat.studentName}</p>
                <p className="text-sm text-gray-500">{stat.studentEmail}</p>
              </td>
              <td className="py-3 px-4">
                <span className="text-lg font-bold">{stat.score}%</span>
              </td>
              <td className="py-3 px-4">
                {stat.passed ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    ✅ Réussi
                  </span>
                ) : (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                    ❌ Échoué
                  </span>
                )}
              </td>
              <td className="py-3 px-4 text-sm text-gray-500">
                {stat.completedAt
                  ? new Date(stat.completedAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })
                  : '-'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}