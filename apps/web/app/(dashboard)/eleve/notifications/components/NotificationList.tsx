'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: Date | string
}

interface NotificationListProps {
  notifications: Notification[]
}

const TYPE_ICONS: Record<string, string> = {
  COURS_NEW: '📚',
  QUIZ_AVAILABLE: '📝',
  QUIZ_RESULT: '📊',
  MESSAGE: '💬',
  BADGE_EARNED: '🏆',
  XP_EARNED: '⭐',
}

const TYPE_COLORS: Record<string, string> = {
  COURS_NEW: 'bg-blue-100 text-blue-700',
  QUIZ_AVAILABLE: 'bg-purple-100 text-purple-700',
  QUIZ_RESULT: 'bg-green-100 text-green-700',
  MESSAGE: 'bg-yellow-100 text-yellow-700',
  BADGE_EARNED: 'bg-indigo-100 text-indigo-700',
  XP_EARNED: 'bg-orange-100 text-orange-700',
}

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter()
  const api = useApiClient()
  const [markingId, setMarkingId] = useState<string | null>(null)

  const handleMarkAsRead = async (notificationId: string) => {
    setMarkingId(notificationId)
    try {
      await api.notifications.markAsRead(notificationId)
      console.log('✅ Notification marquée comme lue')
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur:', error.message)
      }
    } finally {
      setMarkingId(null)
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <p className="text-4xl mb-4">📭</p>
        <p className="text-gray-500">Aucune notification pour le moment</p>
        <p className="text-sm text-gray-400 mt-2">
          Les notifications apparaîtront ici lorsque vous aurez des activités.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white rounded-xl shadow-md p-4 transition hover:shadow-lg ${
            notification.isRead ? 'opacity-70' : 'border-l-4 border-indigo-500'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <span className="text-2xl">
                {TYPE_ICONS[notification.type] || '📌'}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{notification.title}</h3>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    TYPE_COLORS[notification.type] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {notification.type.replace('_', ' ')}
                </span>
                {!notification.isRead && (
                  <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                    Nouveau
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span className="text-xs text-gray-400">
                  {new Date(notification.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {notification.link && (
                  <Link href={notification.link}>
                    <span className="text-xs text-indigo-600 hover:underline cursor-pointer">
                      Voir →
                    </span>
                  </Link>
                )}
                {!notification.isRead && (
                  <button
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={markingId === notification.id}
                    className="text-xs text-gray-400 hover:text-gray-600 transition"
                  >
                    {markingId === notification.id ? '...' : 'Marquer comme lu'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}