import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getApiClient } from '@/lib/apiServer'
import { ApiError } from '@lms-scolaire/api-client'
import { BankQuestionForm } from './components/BankQuestionForm'
import { BankQuestionList } from './components/BankQuestionList'

interface BankPageProps {
  params: Promise<{ bankId: string }>
}

export default async function BankPage({ params }: BankPageProps) {
  const { bankId } = await params
  const api = await getApiClient()

  let bank
  let questions
  try {
    bank = await api.banks.getById(bankId)
    questions = await api.banks.listQuestions(bankId)
  } catch (error) {
    if (error instanceof ApiError) {
      console.error('❌ Erreur chargement banque:', error.message)
      if (error.status === 401) redirect('/sign-in')
      if (error.status === 403 || error.status === 404) redirect('/enseignant/banque')
    }
    throw error
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link href="/enseignant/banque" className="text-indigo-600 hover:text-indigo-800 mb-4 block">
            ← Retour aux banques
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">📚 {bank.name}</h1>
              <p className="text-gray-600">
                {bank.description || 'Aucune description'}
              </p>
              <div className="flex gap-2 mt-2">
                {bank.subject && (
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {bank.subject}
                  </span>
                )}
                {bank.level && (
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                    {bank.level}
                  </span>
                )}
                {bank.isPublic && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    🌍 Publique
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-indigo-600">{questions.length}</p>
              <p className="text-sm text-gray-500">questions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">➕ Ajouter une question</h2>
          <BankQuestionForm bankId={bankId} />
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">📋 Questions ({questions.length})</h2>
          <BankQuestionList questions={questions} bankId={bankId} />
        </div>
      </div>
    </div>
  )
}