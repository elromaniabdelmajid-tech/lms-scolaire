import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'
import { QuestionForm } from './components/QuestionForm'
import { QuestionList } from './components/QuestionList'

interface QuizQuestionsPageProps {
  params: Promise<{ quizId: string }>
}

export default async function QuizQuestionsPage({ params }: QuizQuestionsPageProps) {
  const { quizId } = await params
  const api = await getApiClient()

  let quiz
  let questions
  try {
    quiz = await api.quizzes.getById(quizId)
    questions = await api.questions.listByQuiz(quizId)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement quiz:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/enseignant')
    }
    throw error
  }

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
          <div>
            <h1 className="text-3xl font-bold">📝 {quiz.title}</h1>
            <p className="text-gray-600">
              {questions.length} question{questions.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">➕ Ajouter une question</h2>
          <QuestionForm quizId={quiz.id} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📋 Questions ({questions.length})</h2>
          <QuestionList questions={questions} quizId={quiz.id} />
        </div>
      </div>
    </div>
  )
}