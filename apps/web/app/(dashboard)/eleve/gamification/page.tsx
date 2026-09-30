import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'

export default async function GamificationPage() {
  const api = await getApiClient()

  let data
  try {
    data = await api.student.getGamification()
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement gamification:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403) redirect('/dashboard')
    }
    throw error
  }

  const { totalXP, level, userBadges, allBadges } = data

  const currentLevelXP = (level - 1) * 100
  const nextLevelXP = level * 100
  const progressToNextLevel = totalXP - currentLevelXP
  const progressPercent = Math.min(
    Math.round((progressToNextLevel / 100) * 100),
    100,
  )

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/eleve"
            className="text-indigo-600 hover:text-indigo-800 mb-4 block"
          >
            ← Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-bold">🏆 Gamification</h1>
          <p className="text-gray-600">
            Suivez votre progression et débloquez des badges !
          </p>
        </div>

        {/* XP et Niveau */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-4xl">
              {level >= 10 ? '👑' : level >= 5 ? '🏆' : level >= 3 ? '⭐' : '🌱'}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Niveau {level}</h2>
                  <p className="text-gray-500">{totalXP} XP</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">
                    {Math.max(progressToNextLevel, 0)} / 100 XP
                  </p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mt-2">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{totalXP}</p>
            <p className="text-sm text-gray-500">XP Totaux</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-green-600">
              {userBadges.length}
            </p>
            <p className="text-sm text-gray-500">Badges débloqués</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{level}</p>
            <p className="text-sm text-gray-500">Niveau actuel</p>
          </div>
        </div>

        {/* Badges débloqués */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">🎖️ Mes badges</h2>
          {userBadges.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Aucun badge débloqué pour le moment. Continuez à apprendre !
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {userBadges.map((badge: any) => (
                <div
                  key={badge.id}
                  className="bg-gray-50 rounded-lg p-4 text-center hover:shadow-md transition"
                >
                  <div className="text-4xl mb-2">{badge.icon}</div>
                  <p className="font-semibold text-sm">{badge.name}</p>
                  <p className="text-xs text-gray-500">{badge.description}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(badge.earnedAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tous les badges */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📋 Tous les badges disponibles</h2>
          {allBadges.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              Aucun badge disponible.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allBadges.map((badge: any) => {
                const hasBadge = userBadges.some(
                  (ub: any) => ub.id === badge.id,
                )
                return (
                  <div
                    key={badge.id}
                    className={`rounded-lg p-4 text-center transition ${hasBadge ? 'bg-green-50 border border-green-200' : 'bg-gray-50 opacity-60'}`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <p className="font-semibold text-sm">{badge.name}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                    {hasBadge ? (
                      <span className="text-xs text-green-600">
                        ✅ Débloqué
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        🔒 Verrouillé
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}