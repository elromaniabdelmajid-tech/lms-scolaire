import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'
import { QuizOverview } from './components/QuizOverview'
import { QuestionStats } from './components/QuestionStats'
import { StudentStats } from './components/StudentStats'

interface StatsPageProps {
  params: Promise<{ quizId: string }>
}

export default async function StatistiquesPage({ params }: StatsPageProps) {
  const { quizId } = await params
  const api = await getApiClient()

  let quiz: any
  try {
    quiz = await api.quizzes.getStatistiques(quizId)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement stats:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/enseignant')
    }
    throw error
  }

  const completedAttempts = quiz.attempts.filter((a: any) => a.completedAt !== null)
  const totalAttempts = completedAttempts.length
  const averageScore =
    totalAttempts > 0
      ? Math.round(
          completedAttempts.reduce((acc: number, a: any) => acc + (a.score || 0), 0) /
            totalAttempts,
        )
      : 0
  const passingScore = quiz.passingScore || 70
  const passedAttempts = completedAttempts.filter(
    (a: any) => (a.score || 0) >= passingScore,
  ).length
  const successRate =
    totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0

  const questionStats = quiz.questions.map((q: any) => {
    const correctOptionIds = q.options.filter((o: any) => o.isCorrect).map((o: any) => o.id)
    const totalAnswers = q.answers.length
    const correctAnswers = q.answers.filter((a: any) => {
      if (a.optionId) return correctOptionIds.includes(a.optionId)
      return a.isCorrect === true
    }).length
    const rate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0

    return {
      id: q.id,
      text: q.text,
      type: q.type,
      points: q.points,
      totalAnswers,
      correctAnswers,
      successRate: rate,
    }
  })

  const studentStats = completedAttempts.map((attempt: any) => ({
    id: attempt.id,
    studentName:
      `${attempt.user.prenom || ''} ${attempt.user.nom || ''}`.trim() || 'Élève',
    studentEmail: attempt.user.email,
    score: attempt.score || 0,
    completedAt: attempt.completedAt,
    passed: (attempt.score || 0) >= passingScore,
  }))

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/enseignant/chapitres/${quiz.chapterId}/quiz`}
            className="text-indigo-600 hover:text-indigo-800 mb-4 block"
          >
            ← Retour aux quiz
          </Link>
          <h1 className="text-3xl font-bold">📊 Statistiques - {quiz.title}</h1>
          <p className="text-gray-600">
            {totalAttempts} tentative{totalAttempts > 1 ? 's' : ''} complétée
            {totalAttempts > 1 ? 's' : ''}
          </p>
        </div>

        <QuizOverview
          totalAttempts={totalAttempts}
          averageScore={averageScore}
          successRate={successRate}
          passingScore={passingScore}
          totalQuestions={quiz.questions.length}
        />

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📝 Statistiques par question</h2>
          <QuestionStats stats={questionStats} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">👨‍🎓 Résultats des élèves</h2>
          <StudentStats stats={studentStats} />
        </div>
      </div>
    </div>
  )
}