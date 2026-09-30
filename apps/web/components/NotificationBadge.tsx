'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useAuth } from '@clerk/nextjs'
import { useApiClient } from '@/lib/useApiClient'

export function NotificationBadge() {
  const api = useApiClient()
  const { isLoaded, isSignedIn } = useAuth()
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // ⏳ Attendre que Clerk soit prêt
    if (!isLoaded || !isSignedIn) return

    let cancelled = false

    async function fetchCount() {
      try {
        setLoading(true)
        const data = await api.notifications.getUnreadCount()
        if (!cancelled) {
          setCount(data.count)
          setError(null)
          console.log('✅ Notifications:', data.count)
        }
      } catch (err) {
        if (!cancelled) {
          // Erreur silencieuse si backend pas encore prêt
          console.debug('⚠️ Notifications indisponibles:', err)
          setError('Erreur')
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30_000)

    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [api, isLoaded, isSignedIn])

  return (
    <div className="relative">
      <Bell className="w-6 h-6 text-gray-600" />
      {!loading && count !== null && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
      {error && (
        <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full w-[18px] h-[18px] flex items-center justify-center">
          !
        </span>
      )}
    </div>
  )
}