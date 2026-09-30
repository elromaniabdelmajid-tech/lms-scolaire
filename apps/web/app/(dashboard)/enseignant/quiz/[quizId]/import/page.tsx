'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'
import { ImportForm } from './components/ImportForm'

interface ImportPageProps {
  params: Promise<{ quizId: string }>
}

interface QuizInfo {
  id: string
  title: string
  chapterId: string
}

export default function ImportPage({ params }: ImportPageProps) {
  const router = useRouter()
  const api = useApiClient()
  const { quizId } = use(params)
  const [quiz, setQuiz] = useState<QuizInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================================
  // CHARGEMENT DU QUIZ
  // ============================================================
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true)
        setError(null)

        const data = await api.quizzes.getById(quizId)
        setQuiz({
          id: data.id,
          title: data.title,
          chapterId: data.chapterId,
        })
      } catch (err) {
        if (err instanceof ApiError) {
          console.error('❌ Erreur chargement quiz:', err.message)
          if (err.status === 401) {
            router.push('/sign-in')
          } else if (err.status === 403) {
            router.push('/dashboard')
          } else if (err.status === 404) {
            router.push('/enseignant')
          } else {
            setError(err.message)
          }
        } else {
          console.error('❌ Erreur inconnue:', err)
          setError('Une erreur est survenue')
        }
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [quizId, api, router])

  // ============================================================
  // AFFICHAGES CONDITIONNELS
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Quiz non trouvé'}</p>
          <Link
            href="/enseignant"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/enseignant/chapitres/${quiz.chapterId}/quiz`}
            className="text-indigo-600 hover:text-indigo-800 mb-4 block"
          >
            ← Retour aux quiz
          </Link>
          <h1 className="text-3xl font-bold">📥 Importer des questions</h1>
          <p className="text-gray-600">Quiz : {quiz.title}</p>
        </div>

        {/* Télécharger le modèle CSV */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📄 Modèle CSV</h2>
          <p className="text-gray-600 mb-4">
            Téléchargez le modèle CSV et remplissez-le avec vos questions.
          </p>
          <a
            href={`${process.env.NEXT_PUBLIC_API_URL}/teacher/quizzes/csv-template`}
            download
            className="inline-block bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-200 transition"
          >
            📥 Télécharger le modèle CSV
          </a>
        </div>

        {/* Importer un fichier */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📤 Importer un fichier CSV</h2>
          <ImportForm quizId={quiz.id} />
        </div>
      </div>
    </div>
  )
}