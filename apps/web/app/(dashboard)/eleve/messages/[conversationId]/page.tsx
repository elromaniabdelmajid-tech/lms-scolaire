import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'
import { MessageList } from '../components/MessageList'
import { MessageForm } from '../components/MessageForm'

interface ConversationPageProps {
  params: Promise<{ conversationId: string }>
}

export default async function ConversationPage({ params }: ConversationPageProps) {
  const { conversationId } = await params
  const api = await getApiClient()

  let data
  try {
    data = await api.student.getConversation(conversationId)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement conversation:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/eleve/messages')
    }
    throw error
  }

  const { conversation, messages, currentUserId } = data

  const otherParticipants = conversation.participants.filter(
    (p: any) => p.user.id !== currentUserId,
  )

  const title =
    conversation.title ||
    otherParticipants
      .map((p: any) => `${p.user.prenom || ''} ${p.user.nom || ''}`.trim())
      .join(', ') ||
    'Conversation'

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/eleve/messages"
            className="text-indigo-600 hover:text-indigo-800"
          >
            ← Retour aux messages
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-md flex flex-col h-[calc(100vh-12rem)]">
          {/* En-tête */}
          <div className="border-b p-4">
            <h1 className="text-xl font-bold">{title}</h1>
            {otherParticipants.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {otherParticipants
                  .map((p: any) => `${p.user.prenom} ${p.user.nom}`)
                  .join(', ')}
              </p>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <MessageList messages={messages} currentUserId={currentUserId} />
          </div>

          {/* Formulaire d'envoi */}
          <div className="border-t p-4">
            <MessageForm
              conversationId={conversationId}
              userId={currentUserId}
            />
          </div>
        </div>
      </div>
    </div>
  )
}