'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError, Notification } from '@lms-scolaire/api-client'
import { NotificationList } from './components/NotificationList'

export default function NotificationsPage() {
  const api = useApiClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchNotifications() {
      try {
        setLoading(true)
        const data = await api.notifications.list()
        if (!cancelled) {
          setNotifications(data)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setError(err.message)
          } else {
            setError('Erreur lors du chargement')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchNotifications()
    return () => {
      cancelled = true
    }
  }, [api])

  const unreadCount = notifications.filter((n) => !n.isRead).length

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-500">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-red-500">Erreur : {error}</p>
        </div>
      </div>
    )
  }

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
              <h1 className="text-3xl font-bold">🔔 Notifications</h1>
              <p className="text-gray-600">
                {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue
                {unreadCount > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>

        <NotificationList notifications={notifications} />
      </div>
    </div>
  )
}