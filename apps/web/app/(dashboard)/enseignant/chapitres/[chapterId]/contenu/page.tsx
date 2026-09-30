import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'
import { ResourceForm } from './components/ResourceForm'
import { ResourceList } from './components/ResourceList'

interface ContenuChapitrePageProps {
  params: Promise<{ chapterId: string }>
}

export default async function ContenuChapitrePage({ params }: ContenuChapitrePageProps) {
  const { chapterId } = await params
  const api = await getApiClient()

  let chapter
  let course
  let resources: any[] = []

  try {
    chapter = await api.chapters.getById(chapterId)
    course = await api.courses.getById(chapter.courseId)
    resources = await api.resources.listByChapter(chapterId)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/enseignant')
    }
    throw error
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="mb-8">
          <Link
            href={`/enseignant/cours/${chapter.courseId}/chapitres`}
            className="text-indigo-600 hover:text-indigo-800 mb-4 block"
          >
            ← Retour aux chapitres
          </Link>
          <div>
            <h1 className="text-3xl font-bold">📄 {chapter.title}</h1>
            <p className="text-gray-600">
              Cours : {course.title} • {resources.length} ressource{resources.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href={`/enseignant/chapitres/${chapter.id}/quiz`}>
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 hover:bg-purple-100 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <h3 className="font-semibold text-purple-700">Gérer les quiz</h3>
                  <p className="text-sm text-purple-600">Créer et gérer les quiz du chapitre</p>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Formulaire d'ajout de ressource */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">➕ Ajouter une ressource</h2>
          <ResourceForm chapterId={chapter.id} />
        </div>

        {/* Liste des ressources */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📂 Ressources</h2>
          <ResourceList resources={resources} chapterId={chapter.id} />
        </div>
      </div>
    </div>
  )
}