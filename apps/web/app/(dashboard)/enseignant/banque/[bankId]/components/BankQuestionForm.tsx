'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

const QUESTION_TYPES = [
  { value: 'SINGLE_CHOICE', label: '✅ Choix unique' },
  { value: 'MULTIPLE_CHOICE', label: '☑️ Choix multiple' },
  { value: 'TRUE_FALSE', label: '⚪ Vrai/Faux' },
  { value: 'TEXT', label: '✏️ Réponse textuelle' },
]

interface Option {
  text: string
  isCorrect: boolean
}

export function BankQuestionForm({ bankId }: { bankId: string }) {
  const router = useRouter()
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    text: '',
    type: 'SINGLE_CHOICE',
    points: '1',
    explanation: '',
  })
  const [options, setOptions] = useState<Option[]>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ])

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { text: '', isCorrect: false }])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, field: keyof Option, value: any) => {
    const newOptions = [...options]
    if (field === 'isCorrect') {
      if (formData.type === 'SINGLE_CHOICE') {
        newOptions.forEach((opt, i) => {
          opt.isCorrect = i === index ? value : false
        })
      } else {
        newOptions[index][field] = value
      }
    } else {
      newOptions[index][field] = value
    }
    setOptions(newOptions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const question = await api.banks.createQuestion(bankId, {
        text: formData.text,
        type: formData.type,
        points: parseInt(formData.points),
        explanation: formData.explanation || undefined,
        options: options.filter((o) => o.text.trim()),
      })

      console.log('✅ Question banque créée:', question.id)
      router.refresh()

      // Reset
      setFormData({
        text: '',
        type: 'SINGLE_CHOICE',
        points: '1',
        explanation: '',
      })
      setOptions([
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ])
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur création question banque:', error.message)
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Texte de la question * (supporte LaTeX)
        </label>
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Explication (optionnel)
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type *
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

      {/* Options */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Options
          </label>
          <button
            type="button"
            onClick={addOption}
            disabled={options.length >= 6}
            className="text-sm text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
          >
            + Ajouter une option
          </button>
        </div>
        <div className="space-y-2">
          {options.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type={
                  formData.type === 'SINGLE_CHOICE' ||
                  formData.type === 'TRUE_FALSE'
                    ? 'radio'
                    : 'checkbox'
                }
                name="correct"
                checked={option.isCorrect}
                onChange={(e) =>
                  updateOption(index, 'isCorrect', e.target.checked)
                }
                className="w-4 h-4 text-indigo-600"
              />
              <input
                type="text"
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                value={option.text}
                onChange={(e) =>
                  updateOption(index, 'text', e.target.value)
                }
                placeholder={`Option ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                disabled={options.length <= 2}
                className="text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                🗑️
              </button>
            </div>
          ))}
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