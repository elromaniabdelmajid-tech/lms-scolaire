'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface ChapterItemProps {
  chapter: {
    id: string
    title: string
    description: string | null
    resources: { id: string }[]
    quizzes?: { id: string; title: string }[]
    progress: { isCompleted: boolean }[]
  }
  index: number
  isCompleted: boolean
  resourceCount: number
  courseId: string
}

export function ChapterItem({
  chapter,
  index,
  isCompleted,
  resourceCount,
  courseId,
}: ChapterItemProps) {
  const router = useRouter()
  const api = useApiClient()
  const [loading, setLoading] = useState(false)

  const hasQuiz = chapter.quizzes && chapter.quizzes.length > 0

  const handleToggleComplete = async () => {
    setLoading(true)
    try {
      await api.progress.toggle({
        chapterId: chapter.id,
        courseId,
        isCompleted: !isCompleted,
      })
      console.log('✅ Progression mise à jour')
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur progression:', error.message)
        alert(error.message || 'Erreur lors de la mise à jour')
      } else {
        alert('Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`border rounded-lg p-4 transition ${
        isCompleted ? 'bg-green-50 border-green-200' : 'hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-400 text-sm font-medium">#{index + 1}</span>
            <h3 className={`font-medium ${isCompleted ? 'text-green-700' : ''}`}>
              {chapter.title}
            </h3>
            {isCompleted && (
              <span className="text-green-600 text-sm">✅ Terminé</span>
            )}
          </div>
          {chapter.description && (
            <p className="text-sm text-gray-500 mt-1">{chapter.description}</p>
          )}
          <div className="flex gap-3 mt-2 flex-wrap">
            <span className="text-xs text-gray-400">
              📄 {resourceCount} ressource{resourceCount > 1 ? 's' : ''}
            </span>
            {hasQuiz && (
              <span className="text-xs text-purple-400">
                📝 {chapter.quizzes!.length} quiz
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link href={`/eleve/chapitres/${chapter.id}`}>
            <button className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 transition">
              Voir le contenu
            </button>
          </Link>
          <button
            onClick={handleToggleComplete}
            disabled={loading}
            className={`text-sm px-3 py-1 rounded transition ${
              isCompleted
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } disabled:opacity-50`}
          >
            {loading ? '...' : isCompleted ? '⏪ Annuler' : '✅ Terminer'}
          </button>
        </div>
      </div>

      {/* Quiz disponibles */}
      {hasQuiz && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-sm font-medium text-gray-700 mb-2">📝 Quiz disponibles :</p>
          <div className="flex flex-wrap gap-2">
            {chapter.quizzes!.map((quiz) => (
              <Link key={quiz.id} href={`/eleve/quiz/${quiz.id}`}>
                <button className="text-sm bg-purple-100 text-purple-700 px-3 py-1.5 rounded hover:bg-purple-200 transition">
                  📝 {quiz.title}
                </button>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}