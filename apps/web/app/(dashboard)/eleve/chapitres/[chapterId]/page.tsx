import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'

interface EleveChapitrePageProps {
  params: Promise<{ chapterId: string }>
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

export default async function EleveChapitrePage({ params }: EleveChapitrePageProps) {
  const { chapterId } = await params
  const api = await getApiClient()

  let chapter
  try {
    chapter = await api.student.getChapter(chapterId)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement chapitre:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/eleve')
    }
    throw error
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link
          href={`/eleve/cours/${chapter.course.id}`}
          className="text-indigo-600 hover:text-indigo-800 mb-6 inline-block"
        >
          ← Retour au cours : {chapter.course.title}
        </Link>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-2xl font-bold">{chapter.title}</h1>
          {chapter.description && (
            <p className="text-gray-600 mt-2">{chapter.description}</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📂 Ressources pédagogiques</h2>

          {chapter.resources.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune ressource pour ce chapitre.
            </p>
          ) : (
            <div className="space-y-3">
              {chapter.resources.map((resource: any) => (
                <a
                  key={resource.id}
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 border rounded-lg hover:shadow-md hover:border-indigo-300 transition group"
                >
                  <span className="text-2xl">
                    {TYPE_ICONS[resource.type] || '📎'}
                  </span>
                  <div className="flex-1">
                    <p className="font-medium group-hover:text-indigo-600 transition">
                      {resource.title}
                    </p>
                    <p className="text-sm text-gray-500">
                      {TYPE_LABELS[resource.type] || resource.type}
                    </p>
                  </div>
                  <span className="text-gray-400 group-hover:text-indigo-600 transition">
                    🔗
                  </span>
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}