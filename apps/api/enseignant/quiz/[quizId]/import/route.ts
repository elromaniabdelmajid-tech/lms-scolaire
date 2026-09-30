import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  req: Request,
  { params }: { params: Promise<{ quizId: string }> | { quizId: string } }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId }
    })

    if (!user || user.role !== 'ENSEIGNANT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const resolvedParams = await Promise.resolve(params)
    const quizId = resolvedParams.quizId

    const quiz = await db.quiz.findUnique({
      where: { id: quizId },
      include: {
        chapter: {
          include: {
            course: true
          }
        }
      }
    })

    if (!quiz || quiz.chapter.course.instructorId !== user.id) {
      return NextResponse.json({ error: 'Quiz non trouvé' }, { status: 404 })
    }

    const body = await req.json()
    const { questions } = body

    if (!questions || !Array.isArray(questions)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 })
    }

    const lastQuestion = await db.question.findFirst({
      where: { quizId },
      orderBy: { position: 'desc' }
    })
    let position = lastQuestion ? lastQuestion.position + 1 : 1

    let imported = 0

    for (const q of questions) {
      const question = await db.question.create({
        data: {
          text: q.question,
          type: q.type || 'SINGLE_CHOICE',
          points: q.points || 1,
          position: position++,
          quizId
        }
      })

      if (q.options && Array.isArray(q.options)) {
        let optPosition = 1
        for (const opt of q.options) {
          if (opt.text && opt.text.trim()) {
            await db.option.create({
              data: {
                text: opt.text,
                isCorrect: opt.isCorrect || false,
                position: optPosition++,
                questionId: question.id
              }
            })
          }
        }
      }

      imported++
    }

    return NextResponse.json({ success: true, imported })
  } catch (error) {
    console.error('Erreur import:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}