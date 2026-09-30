'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface Resource {
  id: string
  title: string
  type: string
  url: string
  createdAt: Date | string
}

interface ResourceListProps {
  resources: Resource[]
  chapterId: string
}

const TYPE_ICONS: Record<string, string> = {
  VIDEO: '🎬',
  PDF: '📄',
  DOC: '📝',
  LINK: '🔗',
  IMAGE: '🖼️',
}

const TYPE_LABELS: Record<string, string> = {
  VIDEO: 'Vidéo',
  PDF: 'PDF',
  DOC: 'Document',
  LINK: 'Lien',
  IMAGE: 'Image',
}

export function ResourceList({ resources, chapterId }: ResourceListProps) {
  const router = useRouter()
  const api = useApiClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (resourceId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) return

    setDeletingId(resourceId)
    try {
      await api.resources.delete(resourceId)
      console.log('✅ Ressource supprimée:', resourceId)
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur suppression:', error.message)
        alert(error.message || 'Erreur lors de la suppression')
      } else {
        console.error('❌ Erreur inconnue:', error)
        alert('Une erreur est survenue')
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (resources.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune ressource pour le moment</p>
        <p className="text-sm mt-1">
          Ajoutez votre première ressource avec le formulaire ci-dessus
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {resources.map((resource) => (
        <div
          key={resource.id}
          className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition"
        >
          <div className="flex items-center gap-4 flex-1">
            <span className="text-2xl">
              {TYPE_ICONS[resource.type] || '📎'}
            </span>
            <div>
              <h3 className="font-medium">{resource.title}</h3>
              <p className="text-sm text-gray-500">
                {TYPE_LABELS[resource.type] || resource.type}
                {' • '}
                {new Date(resource.createdAt).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition"
            >
              Voir
            </a>
            <button
              onClick={() => handleDelete(resource.id)}
              disabled={deletingId === resource.id}
              className="text-sm text-red-600 hover:text-red-800 transition disabled:opacity-50"
            >
              {deletingId === resource.id ? '...' : '🗑️'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}