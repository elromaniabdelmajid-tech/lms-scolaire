'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'
import { SVGEditor } from '@/components/upload/SVGEditor'
import { LaTeX } from '@/components/ui/LaTeX'

const QUESTION_TYPES = [
  { value: 'SINGLE_CHOICE', label: '✅ Choix unique' },
  { value: 'MULTIPLE_CHOICE', label: '☑️ Choix multiple' },
  { value: 'TRUE_FALSE', label: '⚪ Vrai/Faux' },
  { value: 'TEXT', label: '✏️ Réponse textuelle' },
]

export function QuestionForm({ quizId }: { quizId: string }) {
  const router = useRouter()
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [formData, setFormData] = useState({
    text: '',
    type: 'SINGLE_CHOICE',
    points: '1',
    explanation: '',
    svg: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const question = await api.questions.create(quizId, {
        text: formData.text,
        type: formData.type,
        points: parseInt(formData.points),
        explanation: formData.explanation || undefined,
        svg: formData.svg || undefined,
      })

      console.log('✅ Question créée:', question.id)
      router.refresh()

      // Reset
      setFormData({
        text: '',
        type: 'SINGLE_CHOICE',
        points: '1',
        explanation: '',
        svg: '',
      })
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur création question:', error.message)
        alert(error.message || 'Erreur lors de la création de la question')
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
      {/* Texte de la question */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texte de la question * (supporte LaTeX avec $...$)
        </label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="text-xs bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
          >
            {showPreview ? 'Cacher' : 'Afficher'} l'aperçu
          </button>
        </div>
        <textarea
          required
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          value={formData.text}
          onChange={(e) =>
            setFormData({ ...formData, text: e.target.value })
          }
          placeholder="Ex: Quelle est la formule de l'énergie cinétique ? \( E_c = \frac{1}{2}mv^2 \)"
        />
        {showPreview && formData.text && (
          <div className="p-4 bg-gray-50 rounded-lg border mt-2">
            <p className="text-sm text-gray-500 mb-2">Aperçu :</p>
            <div className="text-lg">
              <LaTeX content={formData.text} />
            </div>
          </div>
        )}
      </div>

      {/* Explication */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Explication de la réponse (optionnel)
        </label>
        <textarea
          rows={2}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={formData.explanation}
          onChange={(e) =>
            setFormData({ ...formData, explanation: e.target.value })
          }
          placeholder="Expliquez pourquoi cette réponse est correcte..."
        />
      </div>

      {/* SVG */}
      <SVGEditor
        value={formData.svg}
        onChange={(svg) => setFormData({ ...formData, svg })}
      />

      {/* Type et Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type de question *
          </label>
          <select
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.type}
            onChange={(e) =>
              setFormData({ ...formData, type: e.target.value })
            }
          >
            {QUESTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Points *
          </label>
          <input
            type="number"
            required
            min="1"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.points}
            onChange={(e) =>
              setFormData({ ...formData, points: e.target.value })
            }
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? 'Ajout en cours...' : 'Ajouter la question'}
      </button>
    </form>
  )
}