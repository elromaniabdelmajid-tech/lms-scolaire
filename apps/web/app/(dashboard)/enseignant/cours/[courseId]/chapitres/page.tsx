import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'
import { ChapitreForm } from './components/ChapitreForm'
import { ChapitreList } from './components/ChapitreList'

interface ChapitresPageProps {
  params: Promise<{ courseId: string }>
}

export default async function ChapitresPage({ params }: ChapitresPageProps) {
  const { courseId } = await params
  const api = await getApiClient()

  let course
  try {
    course = await api.courses.getById(courseId)
    // Récupérer les chapitres du cours
    const chapters = await api.chapters.listByCourse(courseId)
    course = { ...course, chapters }
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement cours:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/enseignant')
    }
    throw error
  }

  const chapterCount = course.chapters?.length ?? 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/enseignant" className="text-indigo-600 hover:text-indigo-800 mb-4 block">
            ← Retour au tableau de bord
          </Link>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">📖 {course.title}</h1>
              <p className="text-gray-600">
                Gestion des chapitres • {chapterCount} chapitre{chapterCount > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
              <span className={`px-3 py-1 rounded-full text-sm ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {course.isPublished ? '✅ Publié' : '📝 Brouillon'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">➕ Ajouter un chapitre</h2>
          <ChapitreForm courseId={course.id} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📋 Liste des chapitres</h2>
          <ChapitreList chapters={course.chapters ?? []} courseId={course.id} />
        </div>
      </div>
    </div>
  )
}