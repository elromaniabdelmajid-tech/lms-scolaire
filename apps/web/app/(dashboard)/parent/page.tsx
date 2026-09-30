import { redirect } from 'next/navigation'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'

export default async function ParentDashboard() {
  const api = await getApiClient()

  let data
  try {
    data = await api.parent.getDashboard()
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur dashboard parent:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403) redirect('/dashboard')
    }
    throw error
  }

  const { parent, children, stats } = data

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">👨‍👩‍👦 Tableau de bord Parent</h1>
        <p className="text-gray-600 mb-8">
          Bienvenue, {parent.prenom || 'Parent'} !
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Enfants</p>
            <p className="text-2xl font-bold text-indigo-600">{stats.totalChildren}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Cours suivis</p>
            <p className="text-2xl font-bold text-green-600">{stats.totalCourses}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Chapitres terminés</p>
            <p className="text-2xl font-bold text-purple-600">{stats.totalChaptersCompleted}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Progression globale</p>
            <p className="text-2xl font-bold text-orange-600">{stats.overallProgress}%</p>
          </div>
        </div>

        {children.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-500">Aucun enfant enregistré.</p>
          </div>
        ) : (
          children.map((child: any) => {
            const childTotalChapters =
  child.enrollments?.reduce(
    (acc: number, e: any) => acc + (e.course?.chapters?.length || 0),
    0,
  ) || 0

const childChaptersCompleted =
  child.enrollments?.reduce((acc: number, e: any) => {
    const chaptersInCourse = e.course?.chapters?.length || 0
    return acc + Math.round(((e.progress || 0) / 100) * chaptersInCourse)
  }, 0) || 0

const childProgress =
  childTotalChapters > 0
    ? Math.min(
        Math.round((childChaptersCompleted / childTotalChapters) * 100),
        100,
      )
    : 0

            return (
              <div
                key={child.id}
                className="bg-white rounded-xl shadow-md p-6 mb-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold">
                      {child.prenom} {child.nom}
                    </h2>
                    <p className="text-sm text-gray-500">{child.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Progression</p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {childProgress}%
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-indigo-600 h-2.5 rounded-full"
                      style={{ width: `${childProgress}%` }}
                    />
                  </div>
                </div>

                {child.enrollments && child.enrollments.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold">📖 Cours suivis</h3>
                    {child.enrollments.map((enrollment: any) => (
                      <div
                        key={enrollment.id}
                        className="flex justify-between border-b py-2"
                      >
                        <span>{enrollment.course?.title || 'Cours inconnu'}</span>
                        <span className="text-indigo-600">
                          {Math.round(enrollment.progress || 0)}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}