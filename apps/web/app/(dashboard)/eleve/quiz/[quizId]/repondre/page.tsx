'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useApiClient } from '@/lib/useApiClient'
import { ApiError } from '@lms-scolaire/api-client'
import { renderLatexToString } from '@/lib/render-latex'
import { SVGDisplay } from '@/components/ui/SVGDisplay'

interface Question {
  id: string
  text: string
  type: string
  points: number
  explanation: string | null
  svg: string | null
  options: { id: string; text: string }[]
}

export default function EleveQuizRepondre({
  params,
}: {
  params: Promise<{ quizId: string }>
}) {
  const router = useRouter()
  const api = useApiClient()
  const { quizId } = use(params)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [quiz, setQuiz] = useState<{
    title: string
    questions: Question[]
  } | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{
    isCorrect: boolean
    explanation: string | null
    correctOptions: string[]
  } | null>(null)

  // ============================================================
  // CHARGEMENT DU QUIZ
  // ============================================================
  useEffect(() => {
    const loadQuiz = async () => {
      try {
        setLoading(true)
        setError(null)

        // 1. Démarrer une tentative
        const startData = await api.attempts.start(quizId)
        setAttemptId(startData.attemptId)

        // 2. Récupérer les questions
        const data = await api.attempts.getQuestions(startData.attemptId)
        setQuiz({
          title: data.title,
          questions: data.questions as Question[],
        })

        // 3. Initialiser les réponses
        const initialAnswers: Record<string, string[]> = {}
        data.questions.forEach((q: any) => {
          initialAnswers[q.id] = []
        })
        setAnswers(initialAnswers)
      } catch (err) {
        if (err instanceof ApiError) {
          console.error('❌ Erreur chargement quiz:', err.message)
          setError(err.message || 'Erreur lors du chargement du quiz')
        } else {
          console.error('❌ Erreur inconnue:', err)
          setError('Une erreur est survenue lors du chargement du quiz')
        }
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [quizId, api])

  // Réinitialiser le feedback quand on change de question
  useEffect(() => {
    setFeedback(null)
  }, [currentQuestionIndex])

  // ============================================================
  // RÉPONDRE À UNE QUESTION
  // ============================================================
  const handleAnswer = async (
    questionId: string,
    value: string | string[],
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: Array.isArray(value) ? value : [value],
    }))

    // Vérification immédiate pour les QCM (sauf TEXT)
    if (
      quiz &&
      quiz.questions[currentQuestionIndex].type !== 'TEXT' &&
      typeof value === 'string' &&
      attemptId
    ) {
      try {
        const data = await api.attempts.check(attemptId, {
          questionId,
          selectedOptionIds: [value],
        })
        setFeedback({
          isCorrect: data.isCorrect,
          explanation: data.explanation,
          correctOptions: data.correctOptionIds,
        })
      } catch (error) {
        if (error instanceof ApiError) {
          console.error('❌ Erreur vérification:', error.message)
        }
      }
    }
  }

  // ============================================================
  // SOUMETTRE LE QUIZ
  // ============================================================
  const handleSubmit = async () => {
    const answered = Object.values(answers).every((arr) => arr.length > 0)
    if (!answered) {
      alert('Veuillez répondre à toutes les questions avant de soumettre.')
      return
    }

    if (!confirm('Êtes-vous sûr de vouloir soumettre vos réponses ?')) return

    setSubmitting(true)
    try {
      await api.attempts.submit(attemptId!, { answers })
      console.log('✅ Quiz soumis')
      router.push(`/eleve/quiz/${quizId}/resultats?attemptId=${attemptId}`)
    } catch (err) {
      if (err instanceof ApiError) {
        console.error('❌ Erreur soumission:', err.message)
        alert(err.message || 'Erreur lors de la soumission')
      } else {
        alert('Une erreur est survenue lors de la soumission')
      }
    } finally {
      setSubmitting(false)
    }
  }

  // ============================================================
  // AFFICHAGES CONDITIONNELS
  // ============================================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-500">Chargement du quiz...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
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

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Ce quiz n'a pas de questions.</p>
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

  const currentQuestion = quiz.questions[currentQuestionIndex]
  const totalQuestions = quiz.questions.length
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  const isAnswered = answers[currentQuestion.id]?.length > 0
  const allAnswered = Object.values(answers).every((arr) => arr.length > 0)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Question {currentQuestionIndex + 1} sur {totalQuestions}
          </p>
        </div>

        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
              style={{
                width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div
              className="text-lg font-medium"
              dangerouslySetInnerHTML={{
                __html: renderLatexToString(currentQuestion.text),
              }}
            />
            <span className="text-sm text-gray-500">
              {currentQuestion.points} pts
            </span>
          </div>

          {/* SVG */}
          {currentQuestion.svg && <SVGDisplay svg={currentQuestion.svg} />}

          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              const isSelected =
                answers[currentQuestion.id]?.includes(option.id) || false
              return (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    checked={isSelected}
                    onChange={() =>
                      handleAnswer(currentQuestion.id, option.id)
                    }
                    className="w-4 h-4 text-indigo-600"
                  />
                  <span className={isSelected ? 'font-medium' : ''}>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderLatexToString(option.text),
                      }}
                    />
                  </span>
                </label>
              )
            })}
          </div>

          {/* Feedback */}
          {feedback && (
            <div
              className={`mt-4 p-4 rounded-lg ${
                feedback.isCorrect
                  ? 'bg-green-50 border border-green-200'
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <p
                className={`font-semibold ${
                  feedback.isCorrect ? 'text-green-700' : 'text-red-700'
                }`}
              >
                {feedback.isCorrect
                  ? '✅ Bonne réponse !'
                  : '❌ Mauvaise réponse.'}
              </p>
              {feedback.explanation && (
                <div className="mt-2 text-sm text-gray-700">
                  <p className="font-medium">💡 Explication :</p>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: renderLatexToString(feedback.explanation),
                    }}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-between mt-6">
            <button
              onClick={() =>
                setCurrentQuestionIndex((prev) => prev - 1)
              }
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
            >
              ← Précédent
            </button>

            {isLastQuestion ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
              >
                {submitting ? 'Soumission...' : '📤 Soumettre le quiz'}
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentQuestionIndex((prev) => prev + 1)
                }
                disabled={!isAnswered}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-50"
              >
                Suivant →
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 text-sm text-gray-500 text-center">
          {currentQuestionIndex + 1} / {totalQuestions} questions
          {allAnswered && (
            <span className="ml-2 text-green-600">
              ✅ Toutes les questions ont une réponse
            </span>
          )}
        </div>
      </div>
    </div>
  )
}