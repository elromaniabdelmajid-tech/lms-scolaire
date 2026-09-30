'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'

interface ResultatsPageProps {
  params: Promise<{ quizId: string }>
}

interface QuestionResult {
  id: string
  text: string
  isCorrect: boolean | null
  points: number
  earnedPoints: number
  userAnswer: string | null
  correctAnswer: string | null
}

interface Results {
  attemptId: string
  score: number
  totalPoints: number
  earnedPoints: number
  completedAt: string
  questions: QuestionResult[]
}

export default function ResultatsPage({ params }: ResultatsPageProps) {
  const router = useRouter()
  const api = useApiClient()
  const searchParams = useSearchParams()
  const { quizId } = use(params)
  const attemptId = searchParams.get('attemptId')

  const [loading, setLoading] = useState(true)
  const [resultat, setResultat] = useState<Results | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!attemptId) {
      router.push('/eleve')
      return
    }

    const loadResults = async () => {
      try {
        const data = await api.attempts.getResults(attemptId)
        setResultat(data as Results)
        console.log('✅ Résultats chargés:', data.score)
      } catch (err) {
        if (err instanceof ApiError) {
          console.error('❌ Erreur chargement résultats:', err.message)
          setError(err.message || 'Erreur lors du chargement des résultats')
        } else {
          console.error('❌ Erreur inconnue:', err)
          setError('Une erreur est survenue')
        }
      } finally {
        setLoading(false)
      }
    }

    loadResults()
  }, [attemptId, api, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">
            Chargement des résultats...
          </p>
        </div>
      </div>
    )
  }

  if (error || !resultat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || 'Résultats non trouvés'}
          </p>
          <Link
            href="/eleve"
            className="text-indigo-600 hover:text-indigo-800"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    )
  }

  const passed = resultat.score >= 70
  const totalQuestions = resultat.questions.length
  const correctCount = resultat.questions.filter(
    (q) => q.isCorrect === true,
  ).length

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* En-tête */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">📊 Résultats du quiz</h1>

          {/* Score circulaire */}
          <div className="relative w-32 h-32 mx-auto mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                className="text-gray-200"
                strokeWidth="8"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
              />
              <circle
                className={
                  passed ? 'text-green-600' : 'text-red-600'
                }
                strokeWidth="8"
                strokeDasharray={352}
                strokeDashoffset={352 - (resultat.score / 100) * 352}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="56"
                cx="64"
                cy="64"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">
                {resultat.score}%
              </span>
            </div>
          </div>

          <p className="text-lg">
            {passed ? '🎉 Félicitations !' : '😅 Pas de chance !'}
          </p>
          <p className="text-gray-600">
            {correctCount} / {totalQuestions} bonnes réponses
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Points : {resultat.earnedPoints} / {resultat.totalPoints}
          </p>

          <div className="mt-4">
            <Link href="/eleve">
              <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition">
                Retour au tableau de bord
              </button>
            </Link>
          </div>
        </div>

        {/* Détails des questions */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">
            📝 Détail des réponses
          </h2>
          <div className="space-y-4">
            {resultat.questions.map((q, index) => (
              <div key={q.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium">
                      {index + 1}. {q.text}
                    </p>
                    <div className="mt-2 space-y-1">
                      {q.isCorrect !== null ? (
                        <>
                          <p className="text-sm text-gray-600">
                            Votre réponse :{' '}
                            {q.userAnswer || 'Non répondu'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Réponse correcte :{' '}
                            {q.correctAnswer || 'Non disponible'}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-yellow-600">
                          ⏳ Réponse en attente de correction manuelle
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {q.isCorrect === true && (
                      <span className="text-green-600 font-medium">
                        ✅ {q.earnedPoints} pts
                      </span>
                    )}
                    {q.isCorrect === false && (
                      <span className="text-red-600 font-medium">
                        ❌ 0 pts
                      </span>
                    )}
                    {q.isCorrect === null && (
                      <span className="text-yellow-600 font-medium">
                        ⏳ En attente
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}