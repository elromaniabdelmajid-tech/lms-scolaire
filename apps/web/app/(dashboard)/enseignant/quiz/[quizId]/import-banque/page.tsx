import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'
import { BankSelector } from './components/BankSelector'

interface ImportBanquePageProps {
  params: Promise<{ quizId: string }>
}

export default async function ImportBanquePage({ params }: ImportBanquePageProps) {
  const { quizId } = await params
  const api = await getApiClient()

  let quiz
  let banks
  try {
    quiz = await api.quizzes.getById(quizId)
    banks = await api.banks.list()
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/enseignant')
    }
    throw error
  }

  // Adapter le format : backend renvoie `question_count`, frontend attend `questionCount`
  const formattedBanks = banks.map((bank) => ({
    id: bank.id,
    name: bank.name,
    description: bank.description,
    subject: bank.subject,
    level: bank.level,
    isPublic: bank.isPublic,
    questionCount: (bank as any).question_count ?? 0,
  }))

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/enseignant/chapitres/${quiz.chapterId}/quiz`}
            className="text-indigo-600 hover:text-indigo-800 mb-4 block"
          >
            ← Retour aux quiz
          </Link>
          <h1 className="text-3xl font-bold">📥 Importer depuis la banque</h1>
          <p className="text-gray-600">
            Quiz : {quiz.title}
          </p>
        </div>

        <BankSelector banks={formattedBanks} quizId={quiz.id} />
      </div>
    </div>
  )
}