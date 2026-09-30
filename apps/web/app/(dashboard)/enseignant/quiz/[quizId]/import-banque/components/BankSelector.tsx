'use client'

import { useState } from 'react'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'
import { QuestionSelector } from './QuestionSelector'

interface Bank {
  id: string
  name: string
  description: string | null
  subject: string | null
  level: string | null
  isPublic: boolean
  questionCount: number
}

interface BankSelectorProps {
  banks: Bank[]
  quizId: string
}

export function BankSelector({ banks, quizId }: BankSelectorProps) {
  const api = useApiClient()
  const [selectedBankId, setSelectedBankId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState<any[]>([])

  const handleSelectBank = async (bankId: string) => {
    setSelectedBankId(bankId)
    setLoading(true)

    try {
      const data = await api.banks.listQuestions(bankId)
      setQuestions(data)
      console.log('✅ Questions chargées:', data.length)
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur chargement questions:', error.message)
      } else {
        console.error('❌ Erreur inconnue:', error)
      }
    } finally {
      setLoading(false)
    }
  }

  if (banks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <p className="text-4xl mb-4">📚</p>
        <p className="text-gray-500">
          Aucune banque de questions disponible
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Créez d'abord une banque de questions.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Liste des banques */}
      {!selectedBankId && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📚 Choisir une banque</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banks.map((bank) => (
              <button
                key={bank.id}
                onClick={() => handleSelectBank(bank.id)}
                className="text-left border rounded-lg p-4 hover:shadow-md hover:border-indigo-300 transition"
              >
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{bank.name}</h3>
                  {bank.isPublic && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      🌍 Publique
                    </span>
                  )}
                </div>
                {bank.description && (
                  <p className="text-sm text-gray-500 mt-1">
                    {bank.description}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  {bank.subject && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {bank.subject}
                    </span>
                  )}
                  {bank.level && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                      {bank.level}
                    </span>
                  )}
                  <span className="text-xs text-gray-400">
                    📝 {bank.questionCount} question
                    {bank.questionCount > 1 ? 's' : ''}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Questions de la banque sélectionnée */}
      {selectedBankId && (
        <QuestionSelector
          bankId={selectedBankId}
          quizId={quizId}
          questions={questions}
          loading={loading}
          onBack={() => {
            setSelectedBankId(null)
            setQuestions([])
          }}
        />
      )}
    </div>
  )
}