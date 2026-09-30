import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'
import { EditerCoursForm } from './components/EditerCoursForm'

interface EditerCoursPageProps {
  params: Promise<{ courseId: string }>
}

export default async function EditerCoursPage({ params }: EditerCoursPageProps) {
  const { courseId } = await params
  const api = await getApiClient()

  let course
  try {
    course = await api.courses.getById(courseId)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement cours:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/enseignant')
    }
    throw error
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/enseignant" className="text-indigo-600 hover:text-indigo-800 mb-6 block">
          ← Retour au tableau de bord
        </Link>

        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold mb-6">✏️ Modifier le cours</h1>
          <EditerCoursForm course={course} />
        </div>
      </div>
    </div>
  )
}