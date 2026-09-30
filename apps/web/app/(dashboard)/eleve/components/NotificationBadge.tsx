'use client'

import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { useApiClient } from '@/lib/useApiClient'

export function NotificationBadge() {
  const api = useApiClient()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchCount() {
      try {
        const data = await api.notifications.getUnreadCount()
        if (!cancelled) {
          setCount(data.count)
          console.log('✅ Notifications:', data)
        }
      } catch (err) {
        console.error('❌ Erreur notifications:', err)
      }
    }

    fetchCount()
    const interval = setInterval(fetchCount, 30_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [api])

  return (
    <div className="relative">
      <Bell className="w-6 h-6 text-gray-600" />
      {count !== null && count > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {count > 99 ? '99+' : count}
        </span>
      )}
    </div>
  )
}