import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'

export default async function MessagesPage() {
  const api = await getApiClient()

  let data
  try {
    data = await api.student.getConversations()
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement conversations:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403) redirect('/dashboard')
    }
    throw error
  }

  const { conversations, unreadCount } = data

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
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">💬 Messages</h1>
              <p className="text-gray-600">
                {unreadCount} message{unreadCount > 1 ? 's' : ''} non lu
                {unreadCount > 1 ? 's' : ''}
              </p>
            </div>
            <button
              disabled
              title="Fonctionnalité en développement"
              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
            >
              ✏️ Nouveau message (bientôt)
            </button>
          </div>
        </div>

        {conversations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <p className="text-4xl mb-4">💬</p>
            <p className="text-gray-500">Aucune conversation</p>
            <p className="text-sm text-gray-400 mt-2">
              Commencez une nouvelle conversation avec un enseignant ou un autre
              élève.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv: any) => {
              const otherParticipants = conv.participants.filter(
                (p: any) => p.userId !== p.user.id,
              )
              const lastMessage = conv.lastMessage

              return (
                <Link key={conv.id} href={`/eleve/messages/${conv.id}`}>
                  <div className="bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">
                            {conv.title ||
                              otherParticipants
                                .map((p: any) => `${p.user.prenom} ${p.user.nom}`)
                                .join(', ')}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {lastMessage ? (
                              <>
                                {lastMessage.user.prenom}:{' '}
                                {lastMessage.content.length > 50
                                  ? lastMessage.content.substring(0, 50) + '...'
                                  : lastMessage.content}
                              </>
                            ) : (
                              'Aucun message'
                            )}
                          </span>
                          <span className="text-xs text-gray-400">
                            {lastMessage &&
                              new Date(lastMessage.createdAt).toLocaleDateString(
                                'fr-FR',
                              )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {otherParticipants.map((p: any, idx: number) => (
                          <div
                            key={idx}
                            className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium"
                          >
                            {p.user.prenom?.[0]}
                            {p.user.nom?.[0]}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}