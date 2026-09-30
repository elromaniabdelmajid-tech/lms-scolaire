'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'
import { renderLatexToString } from '@/lib/render-latex'

interface Option {
  id: string
  text: string
  isCorrect: boolean
  position: number
}

interface OptionsListProps {
  options: Option[]
  questionId: string
  questionType: string
}

export function OptionsList({
  options,
  questionId,
  questionType,
}: OptionsListProps) {
  const router = useRouter()
  const api = useApiClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (optionId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette option ?')) return

    setDeletingId(optionId)
    try {
      await api.questions.deleteOption(optionId)
      console.log('✅ Option supprimée:', optionId)
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur suppression option:', error.message)
        alert(error.message || "Erreur lors de la suppression de l'option")
      } else {
        console.error('❌ Erreur inconnue:', error)
        alert('Une erreur est survenue')
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (questionType === 'TEXT') {
    return (
      <div className="text-center py-4 text-gray-500">
        <p>Les questions de type "Réponse textuelle" n'ont pas d'options.</p>
      </div>
    )
  }

  if (options.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune option pour le moment</p>
        <p className="text-sm mt-1">
          Ajoutez votre première option avec le formulaire ci-dessus
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {options.map((option) => (
        <div
          key={option.id}
          className={`flex items-center justify-between p-3 border rounded-lg transition ${
            option.isCorrect
              ? 'bg-green-50 border-green-200'
              : 'hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-3 flex-1">
            <span
              className={
                option.isCorrect ? 'text-green-600' : 'text-gray-400'
              }
            >
              {option.isCorrect ? '✅' : '○'}
            </span>
            <div
              className={
                option.isCorrect
                  ? 'text-green-700 font-medium'
                  : 'text-gray-700'
              }
              dangerouslySetInnerHTML={{
                __html: renderLatexToString(option.text),
              }}
            />
            {option.isCorrect && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                Correcte
              </span>
            )}
          </div>

          {/* ⬇️ BOUTON DE SUPPRESSION RESTAURÉ ⬇️ */}
          <button
            onClick={() => handleDelete(option.id)}
            disabled={deletingId === option.id}
            className="text-sm text-red-600 hover:text-red-800 transition disabled:opacity-50"
            title="Supprimer cette option"
          >
            {deletingId === option.id ? '...' : '🗑️'}
          </button>
          {/* ⬆️ FIN ⬆️ */}
        </div>
      ))}
    </div>
  )
}