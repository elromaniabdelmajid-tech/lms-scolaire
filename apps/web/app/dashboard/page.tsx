import { redirect } from 'next/navigation'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'

export default async function DashboardRedirect() {
  const api = await getApiClient()

  let user
  try {
    user = await api.users.getMe()
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur dashboard redirect:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 404) redirect('/')
    }
    throw error
  }

  console.log('Dashboard: Rôle trouvé:', user.role)

  switch (user.role) {
    case 'ADMIN':
      redirect('/admin')
    case 'ENSEIGNANT':
      redirect('/enseignant')
    case 'ELEVE':
      redirect('/eleve')
    case 'PARENT':
      redirect('/parent')
    default:
      redirect('/eleve')
  }
}