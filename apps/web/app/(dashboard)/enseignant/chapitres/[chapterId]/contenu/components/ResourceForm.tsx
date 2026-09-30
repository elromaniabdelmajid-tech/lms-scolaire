'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface ResourceFormProps {
  chapterId: string
}

const RESOURCE_TYPES = [
  { value: 'VIDEO', label: '🎬 Vidéo' },
  { value: 'PDF', label: '📄 PDF' },
  { value: 'DOC', label: '📝 Document' },
  { value: 'LINK', label: '🔗 Lien' },
  { value: 'IMAGE', label: '🖼️ Image' },
]

export function ResourceForm({ chapterId }: ResourceFormProps) {
  const router = useRouter()
  const api = useApiClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    type: 'PDF',
    url: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const resource = await api.resources.create(chapterId, {
        title: formData.title,
        type: formData.type,
        url: formData.url,
      })

      console.log('✅ Ressource créée:', resource.id)
      router.refresh()

      // Reset du formulaire
      setFormData({
        title: '',
        type: 'PDF',
        url: '',
      })
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur création ressource:', error.message)
        alert(error.message || 'Erreur lors de l\'ajout de la ressource')
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre *
          </label>
          <input
            type="text"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Ex: Cours vidéo - Introduction"
          />
        </div>
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
            {RESOURCE_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL / Fichier *
          </label>
          <input
            type="url"
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formData.url}
            onChange={(e) =>
              setFormData({ ...formData, url: e.target.value })
            }
            placeholder="https://exemple.com/fichier.pdf"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? 'Ajout en cours...' : 'Ajouter la ressource'}
      </button>
    </form>
  )
}