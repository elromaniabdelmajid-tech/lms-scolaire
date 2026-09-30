'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface ExportPDFPageProps {
  params: Promise<{ quizId: string }>
}

export default function ExportPDFPage({ params }: ExportPDFPageProps) {
  const router = useRouter()
  const api = useApiClient()
  const { quizId } = use(params)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // ============================================================
  // CHARGEMENT DES DONNÉES D'EXPORT
  // ============================================================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await api.quizzes.getExportData(quizId)
        setData(result)
        console.log('✅ Données d\'export chargées')
      } catch (err) {
        if (err instanceof ApiError) {
          console.error('❌ Erreur chargement export:', err.message)
          setError(err.message || 'Impossible de charger les données')
        } else {
          console.error('❌ Erreur inconnue:', err)
          setError('Une erreur est survenue')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [quizId, api])

  // ============================================================
  // GÉNÉRATION DU PDF
  // ============================================================
  const handleExport = async () => {
    if (!data) return

    setExporting(true)
    try {
      const { generateQuizResultsPDF } = await import('@/lib/pdf/quiz-results')
      const doc = generateQuizResultsPDF(data)
      doc.save(
        `resultats-${data.quizTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`,
      )
      console.log('✅ PDF généré')
    } catch (err) {
      console.error('❌ Erreur génération PDF:', err)
      alert('Erreur lors de la génération du PDF')
    } finally {
      setExporting(false)
    }
  }

  // ============================================================
  // AFFICHAGES CONDITIONNELS
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || 'Données non trouvées'}
          </p>
          <Link
            href="/enseignant"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/enseignant/chapitres/${data.chapterId}/quiz`}
            className="text-indigo-600 hover:text-indigo-800 mb-4 block"
          >
            ← Retour aux quiz
          </Link>
          <h1 className="text-3xl font-bold">📄 Export PDF</h1>
          <p className="text-gray-600">Quiz : {data.quizTitle}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Résumé</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-indigo-600">
                {data.attempts.length}
              </p>
              <p className="text-sm text-gray-500">Tentatives</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-green-600">
                {data.attempts.length > 0
                  ? Math.round(
                      data.attempts.reduce(
                        (acc: number, a: any) => acc + a.score,
                        0,
                      ) / data.attempts.length,
                    )
                  : 0}
                %
              </p>
              <p className="text-sm text-gray-500">Moyenne</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {data.totalQuestions}
              </p>
              <p className="text-sm text-gray-500">Questions</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-bold text-orange-600">
                {data.passingScore}%
              </p>
              <p className="text-sm text-gray-500">Seuil</p>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="w-full bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {exporting
              ? 'Génération en cours...'
              : '📥 Télécharger le PDF'}
          </button>
        </div>
      </div>
    </div>
  )
}