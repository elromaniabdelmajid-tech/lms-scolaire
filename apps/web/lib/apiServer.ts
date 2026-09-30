import 'server-only'
import { auth } from '@clerk/nextjs/server'
import { ApiClient } from '@lms-scolaire/api-client'

/**
 * Client API côté SERVEUR
 *
 * Utilisation dans un Server Component :
 * ```tsx
 * import { getApiClient } from '@/lib/apiServer'
 *
 * export default async function Page() {
 *   const api = await getApiClient()
 *   const courses = await api.courses.list()
 *   // ...
 * }
 * ```
 */
export async function getApiClient(): Promise<ApiClient> {
  const { getToken } = await auth()

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
      console.warn('🔒 Session expirée (server)')
    },
    onError: (error) => {
      console.error('❌ API Error (server):', error)
    },
  })
}