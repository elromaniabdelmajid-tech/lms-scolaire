import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'

interface ChildDetailPageProps {
  params: Promise<{ childId: string }>
}

export default async function EnfantDetailPage({ params }: ChildDetailPageProps) {
  const { childId } = await params
  const api = await getApiClient()

  let data
  try {
    data = await api.parent.getChild(childId)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement enfant:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/parent')
    }
    throw error
  }

  const { child } = data

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/parent"
          className="text-indigo-600 hover:text-indigo-800 mb-6 block"
        >
          ← Retour au tableau de bord
        </Link>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h1 className="text-3xl font-bold">
            {child.prenom} {child.nom}
          </h1>
          <p className="text-gray-500">{child.email}</p>

          <div className="mt-6 space-y-4">
            {child.enrollments.length === 0 ? (
              <p className="text-gray-500">Aucun cours suivi pour le moment.</p>
            ) : (
              child.enrollments.map((enrollment: any) => (
                <div key={enrollment.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold">{enrollment.course.title}</h3>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-sm text-gray-500">Progression</span>
                    <span className="text-sm font-medium text-indigo-600">
                      {Math.round(enrollment.progress || 0)}%
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full"
                        style={{
                          width: `${Math.round(enrollment.progress || 0)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}