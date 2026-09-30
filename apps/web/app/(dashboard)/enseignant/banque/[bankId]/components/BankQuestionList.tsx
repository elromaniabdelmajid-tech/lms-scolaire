'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { renderLatexToString } from '@/lib/render-latex'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface Option {
  text: string
  isCorrect: boolean
}

interface BankQuestion {
  id: string
  text: string
  type: string
  points: number
  explanation: string | null
  options: Option[]
  tags: string[]
  createdAt: Date | string
}

interface BankQuestionListProps {
  questions: BankQuestion[]
  bankId: string
}

const TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: '✅ Choix unique',
  MULTIPLE_CHOICE: '☑️ Choix multiple',
  TRUE_FALSE: '⚪ Vrai/Faux',
  TEXT: '✏️ Réponse textuelle',
}

export function BankQuestionList({ questions, bankId }: BankQuestionListProps) {
  const router = useRouter()
  const api = useApiClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (questionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return

    setDeletingId(questionId)
    try {
      await api.banks.deleteQuestion(questionId)
      console.log('✅ Question banque supprimée:', questionId)
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
        <p>Aucune question dans cette banque</p>
        <p className="text-sm mt-1">
          Ajoutez votre première question avec le formulaire ci-dessus
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {questions.map((question, index) => (
        <div
          key={question.id}
          className="border rounded-lg p-4 hover:shadow-md transition"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-gray-400 text-sm font-medium">
                  #{index + 1}
                </span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
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

              {question.options && question.options.length > 0 && (
                <div className="mt-2 space-y-1">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
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
                        dangerouslySetInnerHTML={{
                          __html: renderLatexToString(option.text),
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {question.explanation && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
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

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleDelete(question.id)}
                disabled={deletingId === question.id}
                className="text-sm text-red-600 hover:text-red-800 transition disabled:opacity-50"
              >
                {deletingId === question.id ? '...' : '🗑️'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}