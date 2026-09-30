import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'
import { QuizForm } from './components/QuizForm'
import { QuizList } from './components/QuizList'

interface QuizPageProps {
  params: Promise<{ chapterId: string }>
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { chapterId } = await params
  const api = await getApiClient()

  let chapter
  let quizzes
  try {
    chapter = await api.chapters.getById(chapterId)
    quizzes = await api.quizzes.listByChapter(chapterId)
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
            href={`/enseignant/chapitres/${chapter.id}/contenu`}
            className="text-indigo-600 hover:text-indigo-800 mb-4 block"
          >
            ← Retour au contenu du chapitre
          </Link>
          <div>
            <h1 className="text-3xl font-bold">📝 Quiz du chapitre</h1>
            <p className="text-gray-600">
              Chapitre : {chapter.title} • {quizzes.length} quiz
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">➕ Créer un quiz</h2>
          <QuizForm chapterId={chapter.id} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📋 Quiz existants</h2>
          <QuizList quizzes={quizzes} chapterId={chapter.id} />
        </div>
      </div>
    </div>
  )
}