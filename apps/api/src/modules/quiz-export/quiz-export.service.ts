import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { ImportBankDto } from './dto/import-bank.dto'
import { ImportCsvDto } from './dto/import-csv.dto'

@Injectable()
export class QuizExportService {
  private readonly logger = new Logger(QuizExportService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère l'utilisateur ENSEIGNANT
   */
  private async getTeacher(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!user) throw new NotFoundException('Utilisateur non trouvé')
    if (user.role !== 'ENSEIGNANT')
      throw new ForbiddenException('Réservé aux enseignants')

    return user
  }

  /**
   * Vérifie que le quiz appartient à l'enseignant
   */
  private async assertQuizOwner(quizId: string, teacherId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        chapter: {
          include: { course: { select: { instructorId: true } } },
        },
      },
    })

    if (!quiz || quiz.chapter.course.instructorId !== teacherId) {
      throw new NotFoundException('Quiz non trouvé')
    }

    return quiz
  }

  // ============================================================
  // EXPORT (données pour PDF)
  // ============================================================

  async getExportData(clerkId: string, quizId: string) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertQuizOwner(quizId, teacher.id)

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        chapter: {
          include: { course: true },
        },
        questions: {
          include: {
            options: true,
            answers: true,
          },
        },
        attempts: {
          where: { completedAt: { not: null } },
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                prenom: true,
                nom: true,
                email: true,
              },
            },
          },
        },
      },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz non trouvé')
    }

    const passingScore = quiz.passingScore || 70

    const attempts = quiz.attempts.map((attempt: any) => ({
      studentName:
        `${attempt.user.prenom || ''} ${attempt.user.nom || ''}`.trim() ||
        'Élève',
      studentEmail: attempt.user.email,
      score: attempt.score || 0,
      completedAt: attempt.completedAt,
      passed: (attempt.score || 0) >= passingScore,
    }))

    const questionStats = quiz.questions.map((q: any) => {
      const correctOptionIds = q.options
        .filter((o: any) => o.isCorrect)
        .map((o: any) => o.id)

      const totalAnswers = q.answers.length
      const correctAnswers = q.answers.filter((a: any) => {
        if (a.optionId) {
          return correctOptionIds.includes(a.optionId)
        }
        return a.isCorrect === true
      }).length

      const successRate =
        totalAnswers > 0
          ? Math.round((correctAnswers / totalAnswers) * 100)
          : 0

      return {
        text: q.text,
        successRate,
        correctAnswers,
        totalAnswers,
      }
    })

    this.logger.log(`Export PDF généré pour quiz: ${quizId}`)

    return {
      quizTitle: quiz.title,
      quizDescription: quiz.description,
      courseName: quiz.chapter.course.title,
      chapterName: quiz.chapter.title,
      chapterId: quiz.chapterId,
      totalQuestions: quiz.questions.length,
      passingScore,
      attempts,
      questionStats,
    }
  }

  // ============================================================
  // IMPORT DEPUIS BANQUE
  // ============================================================

  async importFromBank(
    clerkId: string,
    quizId: string,
    dto: ImportBankDto,
  ) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertQuizOwner(quizId, teacher.id)

    const bank = await this.prisma.questionBank.findUnique({
      where: { id: dto.bankId },
      select: { userId: true, isPublic: true },
    })

    if (!bank) {
      throw new NotFoundException('Banque non trouvée')
    }

    if (bank.userId !== teacher.id && !bank.isPublic) {
      throw new ForbiddenException('Accès refusé à cette banque')
    }

    const bankQuestions = await this.prisma.bankQuestion.findMany({
      where: {
        id: { in: dto.questionIds },
        bankId: dto.bankId,
      },
    })

    if (bankQuestions.length === 0) {
      throw new NotFoundException('Aucune question trouvée')
    }

    const lastQuestion = await this.prisma.question.findFirst({
      where: { quizId },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    let position = lastQuestion ? lastQuestion.position + 1 : 1
    let imported = 0

    await this.prisma.$transaction(async (tx: any) => {
      for (const bq of bankQuestions) {
        const question = await tx.question.create({
          data: {
            text: bq.text,
            type: bq.type,
            points: bq.points,
            position: position++,
            explanation: bq.explanation,
            quizId,
          },
        })

        const options = bq.options as any

        if (Array.isArray(options)) {
          let optPosition = 1
          for (const opt of options) {
            if (opt.text && String(opt.text).trim()) {
              await tx.option.create({
                data: {
                  text: String(opt.text),
                  isCorrect: opt.isCorrect === true,
                  position: optPosition++,
                  questionId: question.id,
                },
              })
            }
          }
        }

        imported++
      }
    })

    this.logger.log(
      `Import banque: ${imported} questions importées dans le quiz ${quizId}`,
    )

    return { success: true, imported }
  }

  // ============================================================
  // IMPORT CSV
  // ============================================================

  async importCsv(clerkId: string, quizId: string, dto: ImportCsvDto) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertQuizOwner(quizId, teacher.id)

    const lastQuestion = await this.prisma.question.findFirst({
      where: { quizId },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    let position = lastQuestion ? lastQuestion.position + 1 : 1
    let imported = 0

    await this.prisma.$transaction(async (tx) => {
      for (const q of dto.questions) {
        const question = await tx.question.create({
          data: {
            text: q.question,
            type: q.type || 'SINGLE_CHOICE',
            points: q.points || 1,
            svg: q.svg || null,
            position: position++,
            quizId,
          },
        })

        let optPosition = 1
        for (const opt of q.options) {
          if (opt.text && opt.text.trim()) {
            await tx.option.create({
              data: {
                text: opt.text,
                isCorrect: opt.isCorrect === true,
                position: optPosition++,
                questionId: question.id,
              },
            })
          }
        }

        imported++
      }
    })

    this.logger.log(
      `Import CSV: ${imported} questions importées dans le quiz ${quizId}`,
    )

    return { success: true, imported }
  }

  // ============================================================
  // CSV TEMPLATE
  // ============================================================

  getCsvTemplate(): string {
    const csvLines = [
      'question,type,points,svg,option1,correct1,option2,correct2,option3,correct3,option4,correct4',
      `"Quelle est la formule de l'énergie cinétique ? \\\\( E_c = \\\\frac{1}{2}mv^2 \\\\)",SINGLE_CHOICE,1,,` +
        `"\\\\( E_c = \\\\frac{1}{2}mv^2 \\\\)",true,` +
        `"\\\\( E_c = mv^2 \\\\)",false,` +
        `"\\\\( E_c = \\\\frac{1}{2}mv \\\\)",false,` +
        `"\\\\( E_c = mgh \\\\)",false`,
      `"Quelle est la capitale de la France ?",SINGLE_CHOICE,1,,"Paris",true,"Londres",false,"Berlin",false,"Madrid",false`,
      `"Le soleil est une étoile",TRUE_FALSE,1,,"Vrai",true,"Faux",false,,,`,
      `"Quelle est la forme de ce dessin ?",SINGLE_CHOICE,2,"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><circle cx='50' cy='50' r='40' fill='%234F46E5'/></svg>","Cercle",true,"Carré",false,"Triangle",false,"Rectangle",false`,
      `"Quelle est la forme de ce dessin ?",SINGLE_CHOICE,2,"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><polygon points='50,10 90,90 10,90' fill='%23EF4444'/></svg>","Triangle",true,"Cercle",false,"Carré",false,"Rectangle",false`,
      `"Quelle est la forme de ce dessin ?",SINGLE_CHOICE,2,"<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect x='10' y='10' width='80' height='80' fill='%2310B981'/></svg>","Carré",true,"Cercle",false,"Triangle",false,"Rectangle",false`,
    ]

    return csvLines.join('\n')
  }
}