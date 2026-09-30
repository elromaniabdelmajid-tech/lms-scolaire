import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'
import { CreateOptionDto } from './dto/create-option.dto'
import { UpdateOptionDto } from './dto/update-option.dto'

@Injectable()
export class QuestionsService {
  private readonly logger = new Logger(QuestionsService.name)

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

  /**
   * Vérifie que la question appartient à un quiz de l'enseignant
   */
  private async assertQuestionOwner(questionId: string, teacherId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: {
        quiz: {
          include: {
            chapter: {
              include: { course: { select: { instructorId: true } } },
            },
          },
        },
      },
    })

    if (!question || question.quiz.chapter.course.instructorId !== teacherId) {
      throw new NotFoundException('Question non trouvée')
    }

    return question
  }

  /**
   * Vérifie que l'option appartient à l'enseignant (via question → quiz → course)
   */
  private async assertOptionOwner(optionId: string, teacherId: string) {
    const option = await this.prisma.option.findUnique({
      where: { id: optionId },
      include: {
        question: {
          include: {
            quiz: {
              include: {
                chapter: {
                  include: { course: { select: { instructorId: true } } },
                },
              },
            },
          },
        },
      },
    })

    if (
      !option ||
      option.question.quiz.chapter.course.instructorId !== teacherId
    ) {
      throw new NotFoundException('Option non trouvée')
    }

    return option
  }

  // ============================================================
  // QUESTIONS
  // ============================================================

  /**
   * Crée une question (auto-position)
   */
  async createQuestion(
    clerkId: string,
    quizId: string,
    dto: CreateQuestionDto,
  ) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertQuizOwner(quizId, teacher.id)

    const lastQuestion = await this.prisma.question.findFirst({
      where: { quizId },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const position = lastQuestion ? lastQuestion.position + 1 : 1

    const question = await this.prisma.question.create({
      data: {
        text: dto.text,
        type: dto.type,
        points: dto.points ?? 1,
        explanation: dto.explanation ?? null,
        svg: dto.svg ?? null,
        position,
        quizId,
      },
    })

    this.logger.log(`Question créée: ${question.id} (position ${position})`)
    return question
  }

  /**
   * Liste les questions d'un quiz
   */
  async findAllQuestionsByQuiz(clerkId: string, quizId: string) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertQuizOwner(quizId, teacher.id)

    return this.prisma.question.findMany({
      where: { quizId },
      orderBy: { position: 'asc' },
      include: { options: { orderBy: { position: 'asc' } } },
    })
  }

  /**
   * Récupère une question par ID
   */
  async findOneQuestion(clerkId: string, questionId: string) {
    const teacher = await this.getTeacher(clerkId)
    const question = await this.assertQuestionOwner(questionId, teacher.id)

    return this.prisma.question.findUnique({
      where: { id: question.id },
      include: { options: { orderBy: { position: 'asc' } } },
    })
  }

  /**
   * Modifie une question
   */
  async updateQuestion(
    clerkId: string,
    questionId: string,
    dto: UpdateQuestionDto,
  ) {
    const teacher = await this.getTeacher(clerkId)
    const question = await this.assertQuestionOwner(questionId, teacher.id)

    const updated = await this.prisma.question.update({
      where: { id: questionId },
      data: {
        text: dto.text ?? question.text,
        type: dto.type ?? question.type,
        points: dto.points ?? question.points,
        explanation:
          dto.explanation !== undefined ? dto.explanation : question.explanation,
        svg: dto.svg !== undefined ? dto.svg : question.svg,
        ...(dto.position !== undefined && { position: dto.position }),
      },
    })

    this.logger.log(`Question mise à jour: ${questionId}`)
    return updated
  }

  // ============================================================
  // OPTIONS
  // ============================================================

  /**
   * Crée une option (auto-position)
   */
  async createOption(
    clerkId: string,
    questionId: string,
    dto: CreateOptionDto,
  ) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertQuestionOwner(questionId, teacher.id)

    const lastOption = await this.prisma.option.findFirst({
      where: { questionId },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const position = lastOption ? lastOption.position + 1 : 1

    const option = await this.prisma.option.create({
      data: {
        text: dto.text,
        isCorrect: dto.isCorrect ?? false,
        position,
        questionId,
      },
    })

    this.logger.log(`Option créée: ${option.id} (position ${position})`)
    return option
  }

  /**
   * Liste les options d'une question
   */
  async findAllOptionsByQuestion(clerkId: string, questionId: string) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertQuestionOwner(questionId, teacher.id)

    return this.prisma.option.findMany({
      where: { questionId },
      orderBy: { position: 'asc' },
    })
  }

  /**
   * Modifie une option
   */
  async updateOption(clerkId: string, optionId: string, dto: UpdateOptionDto) {
    const teacher = await this.getTeacher(clerkId)
    const option = await this.assertOptionOwner(optionId, teacher.id)

    const updated = await this.prisma.option.update({
      where: { id: optionId },
      data: {
        text: dto.text ?? option.text,
        isCorrect: dto.isCorrect ?? option.isCorrect,
        ...(dto.position !== undefined && { position: dto.position }),
      },
    })

    this.logger.log(`Option mise à jour: ${optionId}`)
    return updated
  }
  
  
    /**
   * Supprime une question (et ses options en cascade)
   */
  async deleteQuestion(clerkId: string, questionId: string) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertQuestionOwner(questionId, teacher.id)

    await this.prisma.question.delete({
      where: { id: questionId },
    })

    this.logger.log(`Question supprimée: ${questionId}`)
    return { success: true }
  }

  /**
   * Supprime une option
   */
  async deleteOption(clerkId: string, optionId: string) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertOptionOwner(optionId, teacher.id)

    await this.prisma.option.delete({
      where: { id: optionId },
    })

    this.logger.log(`Option supprimée: ${optionId}`)
    return { success: true }
  }
}