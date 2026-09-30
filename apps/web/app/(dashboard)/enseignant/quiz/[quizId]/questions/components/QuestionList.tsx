'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'
import { renderLatexToString } from '@/lib/render-latex'
import { SVGDisplay } from '@/components/ui/SVGDisplay'

interface Option {
  id: string
  text: string
  isCorrect: boolean
}


interface Question {
  id: string
  text: string
  type: string
  points: number
  position: number
  explanation: string | null
  svg: string | null
  options?: Option[]   // ← AJOUTER `?`
}

interface QuestionListProps {
  questions: Question[]
  quizId: string
}

const TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: '✅ Choix unique',
  MULTIPLE_CHOICE: '☑️ Choix multiple',
  TRUE_FALSE: '⚪ Vrai/Faux',
  TEXT: '✏️ Réponse textuelle',
}

const TYPE_ICONS: Record<string, string> = {
  SINGLE_CHOICE: '🔘',
  MULTIPLE_CHOICE: '☑️',
  TRUE_FALSE: '⚪',
  TEXT: '✏️',
}

export function QuestionList({ questions, quizId }: QuestionListProps) {
  const router = useRouter()
  const api = useApiClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (questionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return

    setDeletingId(questionId)
    try {
      await api.questions.delete(questionId)
      console.log('✅ Question supprimée:', questionId)
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur suppression:', error.message)
        alert(error.message || 'Erreur lors de la suppression')
      } else {
        console.error('❌ Erreur inconnue:', error)
        alert('Une erreur est survenue')
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (questions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune question pour le moment</p>
        <p className="text-sm mt-1">
          Ajoutez votre première question avec le formulaire ci-dessus
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => {
        const hasOptions = question.options && question.options.length > 0

        return (
          <div
            key={question.id}
            className="border rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-gray-400 text-sm font-medium">
                    #{index + 1}
                  </span>
                  <span className="text-sm bg-gray-100 px-2 py-1 rounded flex items-center gap-1">
                    {TYPE_ICONS[question.type] || '📝'}
                    {TYPE_LABELS[question.type] || question.type}
                  </span>
                  <span className="text-xs text-gray-500">
                    {question.points} pt{question.points > 1 ? 's' : ''}
                  </span>
                </div>

                <div
                  className="font-medium mt-2"
                  dangerouslySetInnerHTML={{
                    __html: renderLatexToString(question.text),
                  }}
                />

                {question.svg && <SVGDisplay svg={question.svg} />}

                {hasOptions && (
                  <div className="mt-3 space-y-1">
                    {question.options?.map((option) => (
                      <div
                        key={option.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span
                          className={
                            option.isCorrect
                              ? 'text-green-600'
                              : 'text-gray-400'
                          }
                        >
                          {option.isCorrect ? '✅' : '○'}
                        </span>
                        <div
                          className={
                            option.isCorrect
                              ? 'text-green-700 font-medium'
                              : 'text-gray-600'
                          }
                          dangerouslySetInnerHTML={{
                            __html: renderLatexToString(option.text),
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {question.explanation && (
                  <div className="mt-3 p-2 bg-blue-50 rounded text-sm">
                    <p className="font-medium text-blue-700">
                      💡 Explication :
                    </p>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderLatexToString(question.explanation),
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  href={`/enseignant/quiz/${quizId}/questions/${question.id}/options`}
                >
                  <button
                    className={`text-sm px-3 py-1 rounded transition ${
                      hasOptions
                        ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {hasOptions ? 'Gérer les options' : 'Ajouter des options'}
                  </button>
                </Link>

                {/* ⬇️ BOUTON SUPPRIMER ⬇️ */}
                <button
                  onClick={() => handleDelete(question.id)}
                  disabled={deletingId === question.id}
                  className="text-sm text-red-600 hover:text-red-800 transition disabled:opacity-50"
                  title="Supprimer cette question"
                >
                  {deletingId === question.id ? '...' : '🗑️'}
                </button>
                {/* ⬆️ FIN BOUTON ⬆️ */}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}