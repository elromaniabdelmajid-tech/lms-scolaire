import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'
import { OptionsForm } from './components/OptionsForm'
import { OptionsList } from './components/OptionsList'

interface OptionsPageProps {
  params: Promise<{ quizId: string; questionId: string }>
}

export default async function OptionsPage({ params }: OptionsPageProps) {
  const { quizId, questionId } = await params
  const api = await getApiClient()

  let question
  let quiz
  try {
    question = await api.questions.getById(questionId)
    quiz = await api.quizzes.getById(quizId)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement question:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/enseignant')
    }
    throw error
  }

  const options = question.options ?? []
  const canAddOptions = question.type !== 'TEXT'

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/enseignant/quiz/${question.quizId}/questions`}
            className="text-indigo-600 hover:text-indigo-800 mb-4 block"
          >
            ← Retour aux questions
          </Link>
          <div>
            <h1 className="text-2xl font-bold">📝 Options de la question</h1>
            <p className="text-gray-600">
              Quiz : {quiz.title} • {options.length} option{options.length > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Question : {question.text}
            </p>
            <span className="inline-block mt-2 text-xs bg-gray-100 px-2 py-1 rounded">
              {question.type === 'SINGLE_CHOICE' && '✅ Choix unique'}
              {question.type === 'MULTIPLE_CHOICE' && '☑️ Choix multiple'}
              {question.type === 'TRUE_FALSE' && '⚪ Vrai/Faux'}
              {question.type === 'TEXT' && '✏️ Réponse textuelle'}
            </span>
          </div>
        </div>

        {canAddOptions ? (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">➕ Ajouter une option</h2>
            <OptionsForm questionId={question.id} questionType={question.type} />
          </div>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <p className="text-yellow-700">
              ℹ️ Les questions de type "Réponse textuelle" n'ont pas d'options.
            </p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📋 Options ({options.length})</h2>
          <OptionsList options={options} questionId={question.id} questionType={question.type} />
        </div>
      </div>
    </div>
  )
}