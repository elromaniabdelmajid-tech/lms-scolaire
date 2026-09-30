'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface QuizFormProps {
  chapterId: string
}

export function QuizForm({ chapterId }: QuizFormProps) {
  const router = useRouter()
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timeLimit: '',
    passingScore: '',
    isPublished: false,
    shuffleQuestions: false,
    shuffleOptions: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const quiz = await api.quizzes.create(chapterId, {
        title: formData.title,
        description: formData.description || undefined,
        timeLimit: formData.timeLimit
          ? parseInt(formData.timeLimit)
          : undefined,
        passingScore: formData.passingScore
          ? parseInt(formData.passingScore)
          : undefined,
        isPublished: formData.isPublished,
        shuffleQuestions: formData.shuffleQuestions,
        shuffleOptions: formData.shuffleOptions,
      })

      console.log('✅ Quiz créé:', quiz.id)
      router.refresh()

      // Reset
      setFormData({
        title: '',
        description: '',
        timeLimit: '',
        passingScore: '',
        isPublished: false,
        shuffleQuestions: false,
        shuffleOptions: false,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur création quiz:', error.message)
        alert(error.message || 'Erreur lors de la création du quiz')
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre du quiz *
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Quiz - Chapitre 1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Description du quiz"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temps limité (minutes)
          </label>
          <input
            type="number"
            min="1"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.timeLimit}
            onChange={(e) =>
              setFormData({ ...formData, timeLimit: e.target.value })
            }
            placeholder="15"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Score minimum (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.passingScore}
            onChange={(e) =>
              setFormData({ ...formData, passingScore: e.target.value })
            }
            placeholder="70"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isPublished"
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            checked={formData.isPublished}
            onChange={(e) =>
              setFormData({ ...formData, isPublished: e.target.checked })
            }
          />
          <label
            htmlFor="isPublished"
            className="text-sm font-medium text-gray-700"
          >
            Publier immédiatement
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="shuffleQuestions"
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            checked={formData.shuffleQuestions}
            onChange={(e) =>
              setFormData({
                ...formData,
                shuffleQuestions: e.target.checked,
              })
            }
          />
          <label
            htmlFor="shuffleQuestions"
            className="text-sm font-medium text-gray-700"
          >
            🔀 Mélanger les questions
          </label>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="shuffleOptions"
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            checked={formData.shuffleOptions}
            onChange={(e) =>
              setFormData({
                ...formData,
                shuffleOptions: e.target.checked,
              })
            }
          />
          <label
            htmlFor="shuffleOptions"
            className="text-sm font-medium text-gray-700"
          >
            🔀 Mélanger les options
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? 'Création en cours...' : 'Créer le quiz'}
      </button>
    </form>
  )
}