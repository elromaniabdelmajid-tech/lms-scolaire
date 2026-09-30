'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface Chapter {
  id: string
  title: string
  description: string | null
  isFree: boolean
  isPublished: boolean
  position: number
}

interface EditerChapitreFormProps {
  chapter: Chapter
  courseId: string
}

export function EditerChapitreForm({
  chapter,
  courseId,
}: EditerChapitreFormProps) {
  const router = useRouter()
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: chapter.title,
    description: chapter.description || '',
    isFree: chapter.isFree,
    isPublished: chapter.isPublished,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await api.chapters.update(chapter.id, {
        title: formData.title,
        description: formData.description || undefined,
        isFree: formData.isFree,
        isPublished: formData.isPublished,
      })

      console.log('✅ Chapitre modifié:', chapter.id)
      router.push(`/enseignant/cours/${courseId}/chapitres`)
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur modification chapitre:', error.message)
        alert(error.message || 'Erreur lors de la modification')
      } else {
        console.error('❌ Erreur inconnue:', error)
        alert('Une erreur est survenue')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      <div className="flex flex-wrap gap-6">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="isFree"
            className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
            checked={formData.isFree}
            onChange={(e) =>
              setFormData({ ...formData, isFree: e.target.checked })
            }
          />
          <label
            htmlFor="isFree"
            className="text-sm font-medium text-gray-700"
          >
            🆓 Chapitre gratuit
          </label>
        </div>

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
            ✅ Publié
          </label>
        </div>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Modification...' : '💾 Enregistrer'}
        </button>
        <button
          type="button"
          onClick={() =>
            router.push(`/enseignant/cours/${courseId}/chapitres`)
          }
          className="px-6 py-3 border rounded-lg hover:bg-gray-50 transition"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}