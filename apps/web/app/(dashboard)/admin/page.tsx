import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'

export default async function AdminDashboard() {
  const api = await getApiClient()

  let data
  try {
    data = await api.admin.getDashboard()
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur dashboard admin:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403) redirect('/dashboard')
    }
    throw error
  }

  const { admin, stats, recentUsers, recentCourses } = data

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">🎯 Tableau de bord Admin</h1>
          <p className="text-gray-600">
            Bienvenue, {admin.prenom || 'Admin'} !
          </p>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                👥
              </div>
              <div>
                <p className="text-sm text-gray-500">Utilisateurs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {stats.totalUsers}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                📚
              </div>
              <div>
                <p className="text-sm text-gray-500">Cours</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.totalCourses}
                </p>
                <p className="text-xs text-gray-400">
                  {stats.totalPublishedCourses} publiés
                </p>
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
                <p className="text-2xl font-bold text-purple-600">
                  {stats.totalChapters}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                📝
              </div>
              <div>
                <p className="text-sm text-gray-500">Quiz</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.totalQuizzes}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Détails par rôle */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-xs text-gray-500">👑 Admins</p>
            <p className="text-xl font-bold text-blue-600">{stats.totalAdmins}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-xs text-gray-500">👨‍🏫 Enseignants</p>
            <p className="text-xl font-bold text-green-600">
              {stats.totalTeachers}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-xs text-gray-500">👨‍🎓 Élèves</p>
            <p className="text-xl font-bold text-purple-600">
              {stats.totalStudents}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-xs text-gray-500">👨‍👩‍👦 Parents</p>
            <p className="text-xl font-bold text-orange-600">
              {stats.totalParents}
            </p>
          </div>
        </div>

        {/* Derniers utilisateurs */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">👥 Derniers utilisateurs</h2>
          </div>

          {recentUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun utilisateur</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u: any) => (
                <div
                  key={u.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium">
                      {u.prenom || ''} {u.nom || ''}
                    </p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        u.role === 'ADMIN'
                          ? 'bg-red-100 text-red-700'
                          : u.role === 'ENSEIGNANT'
                            ? 'bg-blue-100 text-blue-700'
                            : u.role === 'ELEVE'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {u.role}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Derniers cours */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">📚 Derniers cours</h2>
          </div>

          {recentCourses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun cours</p>
          ) : (
            <div className="space-y-3">
              {recentCourses.map((course: any) => (
                <div
                  key={course.id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-gray-500">
                      {course.instructor?.prenom || ''}{' '}
                      {course.instructor?.nom || ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        course.isPublished
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {course.isPublished ? '✅ Publié' : '📝 Brouillon'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(course.createdAt).toLocaleDateString('fr-FR')}
                    </span>
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