'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface Quiz {
  id: string
  title: string
  description: string | null
  timeLimit: number | null
  passingScore: number | null
  isPublished: boolean
  questions?: any[]
  attempts?: any[]
  _count?: {
    questions: number
    attempts: number
  }
}

interface QuizListProps {
  quizzes: Quiz[]
  chapterId: string
}

export function QuizList({ quizzes, chapterId }: QuizListProps) {
  const router = useRouter()
  const api = useApiClient()
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // ============================================================
  // PUBLIER / DÉPUBLIER
  // ============================================================
  const handleTogglePublish = async (
    quizId: string,
    currentStatus: boolean,
  ) => {
    setTogglingId(quizId)

    try {
      await api.quizzes.publish(quizId, {
        isPublished: !currentStatus,
      })

      console.log(
        `✅ Quiz ${!currentStatus ? 'publié' : 'dépublié'}:`,
        quizId,
      )
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur publication:', error.message)
        alert(error.message || 'Erreur lors de la publication')
      } else {
        console.error('❌ Erreur inconnue:', error)
        alert('Une erreur est survenue')
      }
    } finally {
      setTogglingId(null)
    }
  }

  // ============================================================
  // AUCUN QUIZ
  // ============================================================
  if (quizzes.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucun quiz pour ce chapitre</p>
        <p className="text-sm mt-1">
          Créez votre premier quiz avec le formulaire ci-dessus
        </p>
      </div>
    )
  }

  // ============================================================
  // LISTE DES QUIZ
  // ============================================================
  return (
    <div className="space-y-4">
      {quizzes.map((quiz) => {
        const totalQuestions = quiz._count?.questions ?? quiz.questions?.length ?? 0
        const totalAttempts = quiz._count?.attempts ?? quiz.attempts?.length ?? 0
        const averageScore =
  quiz.attempts && quiz.attempts.length > 0
    ? Math.round(
        quiz.attempts.reduce(
          (total: number, attempt: any) => total + (attempt.score || 0),
          0,
        ) / quiz.attempts.length,
      )
    : 0

        return (
          <div
            key={quiz.id}
            className="border rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              {/* INFORMATIONS DU QUIZ */}
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-lg">{quiz.title}</h3>
                  <span
                    className={
                      'text-xs px-2 py-1 rounded ' +
                      (quiz.isPublished
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700')
                    }
                  >
                    {quiz.isPublished ? '✅ Publié' : '📝 Brouillon'}
                  </span>
                </div>

                {quiz.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {quiz.description}
                  </p>
                )}

                <div className="flex gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                  <span>
                    📝 {totalQuestions}{' '}
                    {totalQuestions === 1 ? 'question' : 'questions'}
                  </span>
                  <span>
                    👥 {totalAttempts}{' '}
                    {totalAttempts === 1 ? 'tentative' : 'tentatives'}
                  </span>
                  {totalAttempts > 0 && (
                    <span>📊 Moyenne : {averageScore}%</span>
                  )}
                  {quiz.timeLimit && (
                    <span>⏱️ {quiz.timeLimit} min</span>
                  )}
                  {quiz.passingScore && (
                    <span>🎯 Seuil : {quiz.passingScore}%</span>
                  )}
                </div>
              </div>

              {/* BOUTONS D'ACTION */}
              <div className="flex flex-wrap items-center gap-2">
                {/* PUBLIER / DÉPUBLIER */}
                <button
                  type="button"
                  onClick={() =>
                    handleTogglePublish(quiz.id, quiz.isPublished)
                  }
                  disabled={togglingId === quiz.id}
                  className={
                    'text-sm px-3 py-1 rounded transition ' +
                    (quiz.isPublished
                      ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200') +
                    ' disabled:opacity-50'
                  }
                >
                  {togglingId === quiz.id
                    ? '...'
                    : quiz.isPublished
                      ? '📝 Dépublier'
                      : '✅ Publier'}
                </button>

                {/* QUESTIONS */}
                <Link
                  href={`/enseignant/quiz/${quiz.id}/questions`}
                  className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 transition"
                >
                  📝 Questions
                </Link>

                {/* IMPORT CSV */}
                <Link
                  href={`/enseignant/quiz/${quiz.id}/import`}
                  className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition"
                >
                  📥 Importer CSV
                </Link>

                {/* IMPORT BANQUE */}
                <Link
                  href={`/enseignant/quiz/${quiz.id}/import-banque`}
                  className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition"
                >
                  📚 Importer banque
                </Link>

                {/* STATISTIQUES */}
                {totalAttempts > 0 && (
                  <Link
                    href={`/enseignant/quiz/${quiz.id}/statistiques`}
                    className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition"
                  >
                    📊 Statistiques
                  </Link>
                )}

                {/* EXPORT PDF */}
                {totalAttempts > 0 && (
                  <Link
                    href={`/enseignant/quiz/${quiz.id}/export-pdf`}
                    className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition"
                  >
                    📄 Export PDF
                  </Link>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}