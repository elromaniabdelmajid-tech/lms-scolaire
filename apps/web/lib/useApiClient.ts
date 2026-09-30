'use client'

import { useMemo } from 'react'
import { useAuth } from '@clerk/nextjs'
import { ApiClient } from '@lms-scolaire/api-client'

/**
 * Hook React pour utiliser l'ApiClient avec Clerk
 *
 * @example
 * const api = useApiClient()
 * const courses = await api.courses.list()
 */
export function useApiClient(): ApiClient {
  const { getToken } = useAuth()

  return useMemo(() => {
    return new ApiClient({
      baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
      getToken: async () => {
        try {
          return await getToken()
        } catch {
          return null
        }
      },
      onUnauthorized: () => {
        console.warn('🔒 Session expirée — redirection vers /sign-in')
      },
      onError: (error) => {
        console.error('❌ API Error:', error)
      },
    })
  }, [getToken])
}