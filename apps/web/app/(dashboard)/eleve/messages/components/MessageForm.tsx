'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface MessageFormProps {
  conversationId: string
  userId: string
}

export function MessageForm({ conversationId, userId }: MessageFormProps) {
  const router = useRouter()
  const api = useApiClient()
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setSending(true)
    try {
      await api.messages.send({
        conversationId,
        content: content.trim(),
      })

      console.log('✅ Message envoyé')
      setContent('')
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur envoi message:', error.message)
        alert(error.message || "Erreur lors de l'envoi du message")
      } else {
        console.error('❌ Erreur inconnue:', error)
        alert('Une erreur est survenue')
      }
    } finally {
      setSending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Écrivez votre message..."
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        disabled={sending}
      />
      <button
        type="submit"
        disabled={sending || !content.trim()}
        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {sending ? '...' : 'Envoyer'}
      </button>
    </form>
  )
}