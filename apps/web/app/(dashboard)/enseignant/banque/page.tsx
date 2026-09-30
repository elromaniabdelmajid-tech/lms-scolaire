import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { BankList } from './components/BankList'
import { BankForm } from './components/BankForm'
import { ApiError } from '@lms-scolaire/api-client'

export default async function BanquePage() {
  const api = await getApiClient()

  let banks
  try {
    banks = await api.banks.list()
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement banques:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403) redirect('/dashboard')
    }
    throw error
  }

  const formattedBanks = banks.map((bank) => ({
    id: bank.id,
    name: bank.name,
    description: bank.description,
    subject: bank.subject,
    level: bank.level,
    isPublic: bank.isPublic,
    _count: {
      questions: bank.question_count ?? 0
    }
  }))

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/enseignant" className="text-indigo-600 hover:text-indigo-800 mb-4 block">
            ← Retour au tableau de bord
          </Link>
          <h1 className="text-3xl font-bold">📚 Banque de questions</h1>
          <p className="text-gray-600">
            Créez et gérez vos banques de questions réutilisables
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">➕ Créer une banque</h2>
          <BankForm />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📋 Mes banques</h2>
          <BankList banks={formattedBanks} />
        </div>
      </div>
    </div>
  )
}