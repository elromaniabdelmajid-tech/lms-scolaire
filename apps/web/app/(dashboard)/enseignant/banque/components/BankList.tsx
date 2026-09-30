'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface Bank {
  id: string
  name: string
  description: string | null
  subject: string | null
  level: string | null
  isPublic: boolean
  _count: { questions: number }
}

interface BankListProps {
  banks: Bank[]
}

export function BankList({ banks }: BankListProps) {
  const router = useRouter()
  const api = useApiClient()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (bankId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette banque ?')) return

    setDeletingId(bankId)
    try {
      await api.banks.delete(bankId)
      console.log('✅ Banque supprimée:', bankId)
      router.refresh()
    } catch (error) {
      if (error instanceof ApiError) {
        console.error('❌ Erreur suppression banque:', error.message)
        alert(error.message || 'Erreur lors de la suppression')
      } else {
        console.error('❌ Erreur inconnue:', error)
        alert('Une erreur est survenue')
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (banks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Aucune banque de questions</p>
        <p className="text-sm mt-1">
          Créez votre première banque avec le formulaire ci-dessus
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {banks.map((bank) => (
        <div
          key={bank.id}
          className="border rounded-lg p-4 hover:shadow-md transition"
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="font-semibold text-lg">{bank.name}</h3>
                {bank.isPublic && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                    🌍 Publique
                  </span>
                )}
              </div>
              {bank.description && (
                <p className="text-sm text-gray-500 mt-1">
                  {bank.description}
                </p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
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
                <span className="text-xs text-gray-400">
                  📝 {bank._count.questions} question
                  {bank._count.questions > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Link href={`/enseignant/banque/${bank.id}`}>
              <button className="text-sm bg-indigo-100 text-indigo-700 px-3 py-1 rounded hover:bg-indigo-200 transition">
                📝 Gérer
              </button>
            </Link>
            <button
              onClick={() => handleDelete(bank.id)}
              disabled={deletingId === bank.id}
              className="text-sm text-red-600 hover:text-red-800 transition disabled:opacity-50"
            >
              {deletingId === bank.id ? '...' : '🗑️'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}