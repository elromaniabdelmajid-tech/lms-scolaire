interface QuizOverviewProps {
  totalAttempts: number
  averageScore: number
  successRate: number
  passingScore: number
  totalQuestions: number
}

export function QuizOverview({
  totalAttempts,
  averageScore,
  successRate,
  passingScore,
  totalQuestions
}: QuizOverviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
            👥
          </div>
          <div>
            <p className="text-sm text-gray-500">Tentatives</p>
            <p className="text-2xl font-bold text-blue-600">{totalAttempts}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
            📊
          </div>
          <div>
            <p className="text-sm text-gray-500">Moyenne</p>
            <p className="text-2xl font-bold text-green-600">{averageScore}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
            🎯
          </div>
          <div>
            <p className="text-sm text-gray-500">Taux de réussite</p>
            <p className="text-2xl font-bold text-purple-600">{successRate}%</p>
            <p className="text-xs text-gray-400">Seuil: {passingScore}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
            📝
          </div>
          <div>
            <p className="text-sm text-gray-500">Questions</p>
            <p className="text-2xl font-bold text-orange-600">{totalQuestions}</p>
          </div>
        </div>
      </div>
    </div>
  )
}