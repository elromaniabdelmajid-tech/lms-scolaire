'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface OptionsFormProps {
  questionId: string
  questionType: string
}

export function OptionsForm({ questionId, questionType }: OptionsFormProps) {
  const router = useRouter()
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    text: '',
    isCorrect: false,
  })

  const isTrueFalse = questionType === 'TRUE_FALSE'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const option = await api.questions.createOption(questionId, {
        text: formData.text,
        isCorrect: formData.isCorrect,
      })

      console.log('✅ Option créée:', option.id)
      router.refresh()

      // Reset
      setFormData({
        text: '',
        isCorrect: false,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur création option:', error.message)
        alert(error.message || 'Erreur lors de la création de l\'option')
      } else {
        console.error('❌ Erreur inconnue:', error)
        alert('Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texte de l'option *
        </label>
        {isTrueFalse ? (
          <select
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.text}
            onChange={(e) =>
              setFormData({ ...formData, text: e.target.value })
            }
          >
            <option value="">Sélectionner...</option>
            <option value="Vrai">Vrai</option>
            <option value="Faux">Faux</option>
          </select>
        ) : (
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            value={formData.text}
            onChange={(e) =>
              setFormData({ ...formData, text: e.target.value })
            }
            placeholder="Ex: \( E = mc^2 \)"
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="isCorrect"
          className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
          checked={formData.isCorrect}
          onChange={(e) =>
            setFormData({ ...formData, isCorrect: e.target.checked })
          }
        />
        <label
          htmlFor="isCorrect"
          className="text-sm font-medium text-gray-700"
        >
          ✅ Réponse correcte
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? 'Ajout en cours...' : 'Ajouter l\'option'}
      </button>
    </form>
  )
}