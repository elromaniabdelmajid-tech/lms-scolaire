'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface ChapitreFormProps {
  courseId: string
}

export function ChapitreForm({ courseId }: ChapitreFormProps) {
  const router = useRouter()
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isFree: false,
    isPublished: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const chapter = await api.chapters.create(courseId, {
        title: formData.title,
        description: formData.description || undefined,
        isFree: formData.isFree,
        isPublished: formData.isPublished,
      })

      console.log('✅ Chapitre créé:', chapter.id)
      router.refresh()

      // Reset du formulaire
      setFormData({
        title: '',
        description: '',
        isFree: false,
        isPublished: false,
      })
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur création chapitre:', error.message)
        alert(error.message || 'Erreur lors de la création du chapitre')
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
            Titre du chapitre *
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Ex: Introduction"
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
            placeholder="Description du chapitre"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isFree}
            onChange={(e) =>
              setFormData({ ...formData, isFree: e.target.checked })
            }
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Chapitre gratuit</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) =>
              setFormData({ ...formData, isPublished: e.target.checked })
            }
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
          />
          <span className="text-sm text-gray-700">Publier immédiatement</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Ajout en cours...' : 'Ajouter le chapitre'}
        </button>
      </div>
    </form>
  )
}