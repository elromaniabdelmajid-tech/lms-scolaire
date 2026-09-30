import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { shuffleArray } from '@lms-scolaire/shared'
import { PrismaService } from '../../core/prisma/prisma.service'
import { CheckAnswerDto } from './dto/check-answer.dto'
import { SubmitAttemptDto } from './dto/submit-attempt.dto'

@Injectable()
export class StudentAttemptsService {
  private readonly logger = new Logger(StudentAttemptsService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère l'utilisateur ELEVE
   */
  private async getStudent(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!user) throw new NotFoundException('Utilisateur non trouvé')
    if (user.role !== 'ELEVE')
      throw new ForbiddenException('Réservé aux élèves')

    return user
  }

  /**
   * Vérifie que la tentative appartient à l'élève
   */
  private async assertAttemptOwner(attemptId: string, studentId: string) {
    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
    })

    if (!attempt || attempt.userId !== studentId) {
      throw new NotFoundException('Tentative non trouvée')
    }

    return attempt
  }

  // ============================================================
  // START
  // ============================================================

  async start(clerkId: string, quizId: string) {
    const student = await this.getStudent(clerkId)

    // 1. Vérifier que le quiz existe et est publié
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        chapter: {
          include: { course: true },
        },
      },
    })

    if (!quiz || !quiz.isPublished) {
      throw new NotFoundException('Quiz non trouvé ou non publié')
    }

    // 2. Vérifier l'accès : inscription OU chapitre gratuit
    const isEnrolled = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: quiz.chapter.courseId,
        },
      },
    })

    const isFreeChapter = quiz.chapter.isFree

    if (!isEnrolled && !isFreeChapter) {
      throw new ForbiddenException('Non inscrit à ce cours')
    }

    // 3. Chercher une tentative non terminée
    let attempt = await this.prisma.quizAttempt.findFirst({
      where: {
        userId: student.id,
        quizId: quiz.id,
        completedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    })

    // 4. Si trouvée, la réutiliser
    if (attempt) {
      this.logger.log(`Tentative existante réutilisée: ${attempt.id}`)
      return { attemptId: attempt.id }
    }

    // 5. Sinon, en créer une nouvelle (SANS supprimer les anciennes)
    attempt = await this.prisma.quizAttempt.create({
      data: {
        userId: student.id,
        quizId: quiz.id,
      },
    })

    this.logger.log(`Nouvelle tentative créée: ${attempt.id}`)
    return { attemptId: attempt.id }
  }

  // ============================================================
  // QUESTIONS
  // ============================================================

  async getQuestions(clerkId: string, attemptId: string) {
    const student = await this.getStudent(clerkId)
    await this.assertAttemptOwner(attemptId, student.id)

    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { position: 'asc' },
              include: {
                options: { orderBy: { position: 'asc' } },
              },
            },
          },
        },
      },
    })

    if (!attempt) {
      throw new NotFoundException('Tentative non trouvée')
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Quiz déjà terminé')
    }

    // Shuffle des questions si activé
    let questions = [...attempt.quiz.questions]
    if (attempt.quiz.shuffleQuestions) {
      questions = shuffleArray(questions)
    }

    // Formatage (sans `isCorrect` !)
    const formattedQuestions = questions.map((q) => {
      let options = [...q.options]
      if (attempt.quiz.shuffleOptions) {
        options = shuffleArray(options)
      }

      return {
        id: q.id,
        text: q.text,
        type: q.type,
        points: q.points,
        explanation: q.explanation,
        svg: q.svg,
        options: options.map((o) => ({
          id: o.id,
          text: o.text,
        })),
      }
    })

    return {
      attemptId: attempt.id,
      title: attempt.quiz.title,
      questions: formattedQuestions,
    }
  }

  // ============================================================
  // CHECK
  // ============================================================

  async check(clerkId: string, attemptId: string, dto: CheckAnswerDto) {
    const student = await this.getStudent(clerkId)
    await this.assertAttemptOwner(attemptId, student.id)

    const question = await this.prisma.question.findUnique({
      where: { id: dto.questionId },
      include: { options: true },
    })

    if (!question) {
      throw new NotFoundException('Question non trouvée')
    }

    // Calcul
    const correctOptions = question.options.filter((o) => o.isCorrect)
    const correctIds = correctOptions.map((o) => o.id)
    const selectedIds = dto.selectedOptionIds

    let isCorrect = false

    if (question.type === 'TEXT') {
      isCorrect = false  // à corriger manuellement
    } else if (
      question.type === 'SINGLE_CHOICE' ||
      question.type === 'TRUE_FALSE'
    ) {
      isCorrect = selectedIds.length === 1 && correctIds.includes(selectedIds[0])
    } else if (question.type === 'MULTIPLE_CHOICE') {
      isCorrect =
        correctIds.length === selectedIds.length &&
        correctIds.every((id) => selectedIds.includes(id))
    }

    return {
      isCorrect,
      explanation: question.explanation,
      correctOptionIds: correctIds,
    }
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  async submit(clerkId: string, attemptId: string, dto: SubmitAttemptDto) {
    const student = await this.getStudent(clerkId)
    await this.assertAttemptOwner(attemptId, student.id)

    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
      },
    })

    if (!attempt) {
      throw new NotFoundException('Tentative non trouvée')
    }

    if (attempt.completedAt) {
      throw new BadRequestException('Quiz déjà soumis')
    }

    let totalPoints = 0
    let earnedPoints = 0

    // Transaction pour tout enregistrer d'un coup
    await this.prisma.$transaction(async (tx) => {
      // Supprimer les réponses éventuelles de cette tentative (au cas où)
      await tx.answer.deleteMany({ where: { quizAttemptId: attempt.id } })

      for (const [questionId, answerValues] of Object.entries(dto.answers)) {
        const question = attempt.quiz.questions.find((q) => q.id === questionId)
        if (!question) continue

        totalPoints += question.points

        // Normaliser : toujours un tableau
        const values = Array.isArray(answerValues)
          ? answerValues
          : [answerValues]

        // Récupérer les options sélectionnées
        const selectedOptions = await tx.option.findMany({
          where: { id: { in: values } },
        })

        // Calculer isCorrect
        let isCorrect: boolean | null = false

        if (question.type === 'TEXT') {
          isCorrect = null
        } else if (
          question.type === 'SINGLE_CHOICE' ||
          question.type === 'TRUE_FALSE'
        ) {
          const correctOption = question.options.find((o) => o.isCorrect)
          isCorrect = selectedOptions.length === 1 && selectedOptions[0].id === correctOption?.id
        } else if (question.type === 'MULTIPLE_CHOICE') {
          const correctIds = question.options
            .filter((o) => o.isCorrect)
            .map((o) => o.id)
          const selectedIds = selectedOptions.map((o) => o.id)
          isCorrect =
            correctIds.length === selectedIds.length &&
            correctIds.every((id) => selectedIds.includes(id))
        }

        if (isCorrect === true) earnedPoints += question.points

        // Créer une Answer par option sélectionnée (pour MULTIPLE_CHOICE)
        if (question.type === 'TEXT') {
          // Une seule Answer avec le texte
          await tx.answer.create({
            data: {
              userId: student.id,
              questionId: question.id,
              quizAttemptId: attempt.id,
              text: String(values[0]),
              isCorrect: null,
            },
          })
        } else if (selectedOptions.length > 0) {
          // Une Answer par option
          for (const option of selectedOptions) {
            await tx.answer.create({
              data: {
                userId: student.id,
                questionId: question.id,
                quizAttemptId: attempt.id,
                optionId: option.id,
                isCorrect,
              },
            })
          }
        } else {
          // Aucune option sélectionnée → Answer vide
          await tx.answer.create({
            data: {
              userId: student.id,
              questionId: question.id,
              quizAttemptId: attempt.id,
              isCorrect: false,
            },
          })
        }
      }

      // Mettre à jour la tentative
      const score =
        totalPoints > 0
          ? Math.round((earnedPoints / totalPoints) * 100)
          : 0

      await tx.quizAttempt.update({
        where: { id: attempt.id },
        data: {
          score,
          completedAt: new Date(),
        },
      })
    })

    const finalScore =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0

    this.logger.log(
      `Quiz soumis: ${attemptId} — score ${finalScore}% (${earnedPoints}/${totalPoints})`,
    )

    return {
      success: true,
      score: finalScore,
      totalPoints,
      earnedPoints,
    }
  }

  // ============================================================
  // RESULTS
  // ============================================================

  async getResults(clerkId: string, attemptId: string) {
    const student = await this.getStudent(clerkId)
    await this.assertAttemptOwner(attemptId, student.id)

    const attempt = await this.prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: { position: 'asc' },
              include: { options: true },
            },
          },
        },
        answers: {
          include: {
            question: true,
            option: true,
          },
        },
      },
    })

    if (!attempt) {
      throw new NotFoundException('Tentative non trouvée')
    }

    if (!attempt.completedAt) {
      throw new BadRequestException('Quiz non terminé')
    }

      const questions = attempt.quiz.questions.map((q) => {
      const answers = attempt.answers.filter((a) => a.questionId === q.id)
      const userAnswer = answers[0]  // pour single/text
      const correctOptions = q.options.filter((o) => o.isCorrect)
      const correctAnswerText = correctOptions.map((o) => o.text).join(', ')

      // isCorrect global
      let isCorrect: boolean | null = null
      if (q.type === 'TEXT') {
        isCorrect = null
      } else if (answers.length > 0) {
        isCorrect = answers.every((a) => a.isCorrect === true)
      }

      // Réponse utilisateur
      let userAnswerText: string | null = null
      if (q.type === 'TEXT') {
        userAnswerText = userAnswer?.text ?? null
      } else if (answers.length > 0) {
        userAnswerText = answers
          .map((a) => a.option?.text)
          .filter((t) => t !== undefined)
          .join(', ')
      }

      return {
        id: q.id,
        text: q.text,
        type: q.type,
        isCorrect,
        points: q.points,
        earnedPoints: isCorrect === true ? q.points : 0,
        userAnswer: userAnswerText,
        correctAnswer:
          q.type === 'TEXT' ? 'En attente de correction' : correctAnswerText,
      }
    })

    const totalPoints = attempt.quiz.questions.reduce(
      (acc, q) => acc + q.points,
      0,
    )
    const earnedPoints = questions.reduce((acc, q) => acc + q.earnedPoints, 0)

    return {
      attemptId: attempt.id,
      score: attempt.score,
      totalPoints,
      earnedPoints,
      completedAt: attempt.completedAt,
      questions,
    }
  }
}