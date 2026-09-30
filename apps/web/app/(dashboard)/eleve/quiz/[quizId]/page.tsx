import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'

interface EleveQuizPageProps {
  params: Promise<{ quizId: string }>
}

export default async function EleveQuizPage({ params }: EleveQuizPageProps) {
  const { quizId } = await params
  const api = await getApiClient()

  let data
  try {
    data = await api.student.getQuiz(quizId)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement quiz:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/eleve')
    }
    throw error
  }

  const { quiz, existingAttempt } = data

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-6">
          <Link
            href={`/eleve/cours/${quiz.chapter.course.id}`}
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Retour au cours
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          {quiz.description && (
            <p className="text-gray-600 mt-2">{quiz.description}</p>
          )}
          <div className="flex gap-4 mt-4 text-sm text-gray-500">
            <span>📝 {quiz.questions.length} questions</span>
            {quiz.timeLimit && <span>⏱️ {quiz.timeLimit} minutes</span>}
            {quiz.passingScore && <span>🎯 Seuil : {quiz.passingScore}%</span>}
          </div>

          {existingAttempt && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700">
                📊 Vous avez déjà fait ce quiz.
                {quiz.timeLimit !== null &&
                  ' Vous pouvez le refaire pour améliorer votre score.'}
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href={`/eleve/quiz/${quiz.id}/repondre`}>
              <button className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition text-lg">
                🚀 Commencer le quiz
              </button>
            </Link>
            {existingAttempt && (
              <p className="text-sm text-gray-500 mt-2">
                ⚠️ Vous allez refaire ce quiz. Votre précédent score sera conservé.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}