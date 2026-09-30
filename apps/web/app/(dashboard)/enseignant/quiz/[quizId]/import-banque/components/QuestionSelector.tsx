'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'
import { renderLatexToString } from '@/lib/render-latex'

interface QuestionSelectorProps {
  bankId: string
  quizId: string
  questions: any[]
  loading: boolean
  onBack: () => void
}

export function QuestionSelector({
  bankId,
  quizId,
  questions,
  loading,
  onBack,
}: QuestionSelectorProps) {
  const router = useRouter()
  const api = useApiClient()
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [importing, setImporting] = useState(false)

  const toggleQuestion = (questionId: string) => {
    setSelectedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId],
    )
  }

  const toggleAll = () => {
    if (selectedQuestions.length === questions.length) {
      setSelectedQuestions([])
    } else {
      setSelectedQuestions(questions.map((q) => q.id))
    }
  }

  const handleImport = async () => {
    if (selectedQuestions.length === 0) {
      alert('Veuillez sélectionner au moins une question')
      return
    }

    if (
      !confirm(
        `Importer ${selectedQuestions.length} question(s) dans le quiz ?`,
      )
    )
      return

    setImporting(true)
    try {
      const result = await api.quizzes.importBank(
        quizId,
        bankId,
        selectedQuestions,
      )
      console.log('✅ Import réussi:', result.imported)
      alert(`${result.imported} question(s) importée(s) avec succès !`)
      router.push(`/enseignant/chapitres/${quizId}/quiz`)
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur import:', error.message)
        alert(error.message || "Erreur lors de l'import")
      } else {
        console.error('❌ Erreur inconnue:', error)
        alert('Une erreur est survenue')
      }
    } finally {
      setImporting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">Chargement des questions...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-800 text-sm mb-2"
          >
            ← Changer de banque
          </button>
          <h2 className="text-xl font-bold">
            Questions disponibles ({questions.length})
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleAll}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            {selectedQuestions.length === questions.length
              ? 'Tout désélectionner'
              : 'Tout sélectionner'}
          </button>
          <span className="text-sm text-gray-500">
            {selectedQuestions.length} sélectionnée(s)
          </span>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>Cette banque ne contient aucune question</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto mb-4">
          {questions.map((question) => {
            const isSelected = selectedQuestions.includes(question.id)
            const options =
              typeof question.options === 'string'
                ? JSON.parse(question.options)
                : question.options

            return (
              <div
                key={question.id}
                onClick={() => toggleQuestion(question.id)}
                className={`border rounded-lg p-4 cursor-pointer transition ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleQuestion(question.id)}
                    className="mt-1 w-4 h-4 text-indigo-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                        {question.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {question.points} pt{question.points > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div
                      className="font-medium mt-1"
                      dangerouslySetInnerHTML={{
                        __html: renderLatexToString(question.text),
                      }}
                    />
                    {options && options.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {options.map((opt: any, idx: number) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span
                              className={
                                opt.isCorrect
                                  ? 'text-green-600'
                                  : 'text-gray-400'
                              }
                            >
                              {opt.isCorrect ? '✅' : '○'}
                            </span>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: renderLatexToString(opt.text),
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={handleImport}
        disabled={importing || selectedQuestions.length === 0}
        className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {importing
          ? 'Import en cours...'
          : `📥 Importer ${selectedQuestions.length} question(s)`}
      </button>
    </div>
  )
}