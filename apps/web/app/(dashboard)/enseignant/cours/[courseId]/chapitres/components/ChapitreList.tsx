'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface Chapter {
  id: string
  title: string
  description: string | null
  isPublished: boolean
  isFree: boolean
  position: number
}

interface ChapitreListProps {
  chapters: Chapter[]
  courseId: string
}

export function ChapitreList({ chapters, courseId }: ChapitreListProps) {
  const router = useRouter()
  const api = useApiClient()
  const [archivingId, setArchivingId] = useState<string | null>(null)

  const handleArchive = async (chapterId: string) => {
    if (
      !confirm(
        'Voulez-vous vraiment archiver ce chapitre ? Il ne sera plus visible par les élèves.',
      )
    )
      return

    setArchivingId(chapterId)
    try {
      await api.chapters.update(chapterId, { isPublished: false })
      console.log('✅ Chapitre archivé:', chapterId)
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur archivage:', error.message)
        alert(error.message || 'Erreur lors de l\'archivage')
      } else {
        console.error('❌ Erreur inconnue:', error)
        alert('Une erreur est survenue')
      }
    } finally {
      setArchivingId(null)
    }
  }

  const handleRepublish = async (chapterId: string) => {
    setArchivingId(chapterId)
    try {
      await api.chapters.update(chapterId, { isPublished: true })
      console.log('✅ Chapitre republié:', chapterId)
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur republication:', error.message)
        alert(error.message || 'Erreur lors de la republication')
      } else {
        alert('Une erreur est survenue')
      }
    } finally {
      setArchivingId(null)
    }
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucun chapitre pour le moment</p>
        <p className="text-sm mt-1">
          Ajoutez votre premier chapitre avec le formulaire ci-dessus
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {chapters.map((chapter, index) => (
        <div
          key={chapter.id}
          className={`flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition ${
            !chapter.isPublished ? 'bg-gray-50 opacity-75' : ''
          }`}
        >
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-gray-400 text-sm font-medium">
                #{index + 1}
              </span>
              <h3 className="font-medium">{chapter.title}</h3>
              <span
                className={`text-xs px-2 py-1 rounded ${
                  chapter.isPublished
                    ? 'bg-green-100 text-green-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}
              >
                {chapter.isPublished ? '✅ Publié' : '📝 Brouillon'}
              </span>
              {chapter.isFree && (
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                  🆓 Gratuit
                </span>
              )}
            </div>
            {chapter.description && (
              <p className="text-sm text-gray-500 mt-1">
                {chapter.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
           {/* Gérer le contenu */}
<Link href={`/enseignant/chapitres/${chapter.id}/contenu`}>
  <button className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 transition">
    📄 Gérer le contenu
  </button>
</Link>

{/* ⬇️ AJOUTER CE BLOC ⬇️ */}
{/* Gérer les quiz */}
<Link href={`/enseignant/chapitres/${chapter.id}/quiz`}>
  <button className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition">
    📝 Gérer les quiz
  </button>
</Link>
{/* ⬆️ FIN DU BLOC À AJOUTER ⬆️ */}

{/* Modifier */}
<Link
  href={`/enseignant/cours/${courseId}/chapitres/${chapter.id}/editer`}
>
  <button className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200 transition">
    ✏️ Modifier
  </button>
</Link>

            {/* Archiver / Republier */}
            {chapter.isPublished ? (
              <button
                onClick={() => handleArchive(chapter.id)}
                disabled={archivingId === chapter.id}
                className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition disabled:opacity-50"
                title="Archiver (masquer aux élèves)"
              >
                {archivingId === chapter.id ? '...' : '📦 Archiver'}
              </button>
            ) : (
              <button
                onClick={() => handleRepublish(chapter.id)}
                disabled={archivingId === chapter.id}
                className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200 transition disabled:opacity-50"
                title="Republier le chapitre"
              >
                {archivingId === chapter.id ? '...' : '✅ Republier'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}