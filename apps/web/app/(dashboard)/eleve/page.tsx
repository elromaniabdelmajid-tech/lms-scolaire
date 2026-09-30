import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'
import { CourseCard } from './components/CourseCard'
import { StatsCard } from './components/StatsCard'
import { NotificationBadge } from './components/NotificationBadge'

export default async function EleveDashboard() {
  const api = await getApiClient()

  let data
  try {
    data = await api.student.getDashboard()
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur dashboard élève:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403) redirect('/dashboard')
    }
    throw error
  }

  const { student, enrollments, allCourses, unreadMessages } = data
  const totalCourses = allCourses.length
  const totalEnrolled = enrollments.length

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">🎓 Tableau de bord Élève</h1>
            <p className="text-gray-600">
              Bienvenue, {student.prenom || student.nom || 'Élève'} !
            </p>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBadge />
            <Link href="/eleve/messages">
              <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
                <span className="text-xl">💬</span>
                {unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {unreadMessages > 9 ? '9+' : unreadMessages}
                  </span>
                )}
              </button>
            </Link>
            <Link href="/eleve/gamification">
              <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition">
                🏆 Gamification
              </button>
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard icon="📚" title="Cours disponibles" value={totalCourses} color="blue" />
          <StatsCard icon="📖" title="Cours inscrits" value={totalEnrolled} color="indigo" />
          <StatsCard icon="🏆" title="XP" value={0} color="green" />
          <StatsCard
            icon="📊"
            title="Progression moyenne"
            value={totalEnrolled > 0 ? '0%' : '0%'}
            color="purple"
          />
        </div>

        {/* Cours disponibles */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">📚 Cours disponibles</h2>
          {allCourses.length === 0 ? (
            <p className="text-gray-500">Aucun cours disponible pour le moment.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allCourses.map((course: any) => {
                const enrollment = enrollments.find(
                  (e: any) => e.courseId === course.id,
                )
                return (
                  <CourseCard
                    key={course.id}
                    course={course}
                    isEnrolled={!!enrollment}
                    progress={enrollment?.progress || 0}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Mes cours en cours */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📖 Mes cours en cours</h2>
          {enrollments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-2">Vous n'êtes inscrit à aucun cours</p>
              <p className="text-sm text-gray-400">
                Parcourez les cours disponibles et inscrivez-vous !
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment: any) => (
                <div
                  key={enrollment.id}
                  className="border rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {enrollment.course.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {enrollment.course.chapters?.length || 0} chapitres
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-indigo-600">
                        {Math.round(enrollment.progress || 0)}%
                      </span>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{ width: `${enrollment.progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Link href={`/eleve/cours/${enrollment.courseId}`}>
                      <button className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200">
                        Continuer
                      </button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}