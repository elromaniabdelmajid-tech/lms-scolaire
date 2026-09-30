import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'

export default async function EnseignantDashboard() {
  const api = await getApiClient()

  let data
  try {
    data = await api.courses.getTeacherDashboard()
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur dashboard:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403) redirect('/dashboard')
    }
    throw error
  }

  const { teacher, courses, stats, recentEnrollments } = data
  const { totalCourses, totalStudents, totalChapters } = stats

  // Calcul de la progression moyenne
  const averageProgress =
    totalStudents > 0
      ? Math.round(
          courses.reduce((acc: number, c: any) => {
            const sum = c.enrollments.reduce(
              (s: number, e: any) => s + (e.progress || 0),
              0,
            )
            return acc + sum / c.enrollments.length || 0
          }, 0) / totalStudents,
        )
      : 0

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">📚 Tableau de bord Enseignant</h1>
            <p className="text-gray-600">
              Bienvenue, {teacher.prenom || 'Enseignant'} {teacher.nom || ''} !
            </p>
          </div>
          <Link href="/enseignant/cours/creer">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition">
              + Créer un cours
            </button>
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                📖
              </div>
              <div>
                <p className="text-sm text-gray-500">Mes cours</p>
                <p className="text-2xl font-bold text-indigo-600">{totalCourses}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                👨‍🎓
              </div>
              <div>
                <p className="text-sm text-gray-500">Élèves inscrits</p>
                <p className="text-2xl font-bold text-green-600">{totalStudents}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                📑
              </div>
              <div>
                <p className="text-sm text-gray-500">Chapitres</p>
                <p className="text-2xl font-bold text-purple-600">{totalChapters}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                ⭐
              </div>
              <div>
                <p className="text-sm text-gray-500">Progression moyenne</p>
                <p className="text-2xl font-bold text-orange-600">{averageProgress}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Liste des cours */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">📖 Mes cours</h2>
            <div className="flex gap-2">
              <Link
                href="/enseignant/banque"
                className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition"
              >
                📚 Banque de questions
              </Link>
              <Link
                href="/enseignant/cours/creer"
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                + Ajouter
              </Link>
            </div>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Vous n'avez pas encore de cours</p>
              <Link href="/enseignant/cours/creer">
                <button className="text-indigo-600 hover:text-indigo-800">
                  Créer votre premier cours →
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((course: any) => (
                <div
                  key={course.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{course.title}</h3>
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {course.category && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                            {course.category}
                          </span>
                        )}
                        {course.level && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                            {course.level}
                          </span>
                        )}
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}
                        >
                          {course.isPublished ? '✅ Publié' : '📝 Brouillon'}
                        </span>
                      </div>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>📑 {course.chapters.length} chapitres</span>
                        <span>👨‍🎓 {course.enrollments.length} élèves</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Link href={`/enseignant/cours/${course.id}/chapitres`}>
                        <button className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 transition text-nowrap">
                          📄 Gérer
                        </button>
                      </Link>
                      <Link href={`/enseignant/cours/${course.id}/editer`}>
                        <button className="text-sm bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition text-nowrap">
                          ✏️ Modifier
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Activité récente */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">🔄 Activité récente</h2>
          </div>

          {recentEnrollments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune activité récente</p>
          ) : (
            <div className="space-y-3">
              {recentEnrollments.map((enrollment: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">
                      {enrollment.user?.prenom || 'Élève'}{' '}
                      {enrollment.user?.nom || ''}
                    </p>
                    <p className="text-sm text-gray-500">
                      s'est inscrit à "{enrollment.courseTitle}"
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(enrollment.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}