import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ attemptId: string }> | { attemptId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || user.role !== 'ELEVE') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const attemptId = resolvedParams.attemptId

    const body = await req.json()
    const { questionId, selectedOptionId } = body

    const attempt = await db.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                options: true
              }
            }
          }
        }
      }
    })

    if (!attempt || attempt.userId !== user.id) {
      return NextResponse.json({ error: 'Tentative non trouvée' }, { status: 404 })
    }

    const question = attempt.quiz.questions.find(q => q.id === questionId)
    if (!question) {
      return NextResponse.json({ error: 'Question non trouvée' }, { status: 404 })
    }

    const correctOptions = question.options.filter(o => o.isCorrect).map(o => o.id)
    const isCorrect = correctOptions.includes(selectedOptionId)

    return NextResponse.json({
      isCorrect,
      explanation: question.explanation,
      correctOptions
    })
  } catch (error) {
    console.error('Erreur vérification:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}