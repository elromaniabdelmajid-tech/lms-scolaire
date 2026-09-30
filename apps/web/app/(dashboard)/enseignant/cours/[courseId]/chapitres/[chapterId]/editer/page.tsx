import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'
import { EditerChapitreForm } from './components/EditerChapitreForm'

interface EditerPageProps {
  params: Promise<{ courseId: string; chapterId: string }>
}

export default async function EditerChapitrePage({ params }: EditerPageProps) {
  const { courseId, chapterId } = await params
  const api = await getApiClient()

  let chapter
  try {
    chapter = await api.chapters.getById(chapterId)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement chapitre:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/enseignant')
    }
    throw error
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Link
          href={`/enseignant/cours/${courseId}/chapitres`}
          className="text-indigo-600 hover:text-indigo-800 mb-6 block"
        >
          ← Retour aux chapitres
        </Link>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">✏️ Modifier le chapitre</h1>
          <EditerChapitreForm chapter={chapter} courseId={courseId} />
        </div>
      </div>
    </div>
  )
}