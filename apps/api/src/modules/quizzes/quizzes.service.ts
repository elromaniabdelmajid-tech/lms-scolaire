import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { UpdateQuizDto } from './dto/update-quiz.dto'
import { PublishQuizDto } from './dto/publish-quiz.dto'

@Injectable()
export class QuizzesService {
  private readonly logger = new Logger(QuizzesService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère l'utilisateur ENSEIGNANT
   */
  private async getTeacher(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    if (user.role !== 'ENSEIGNANT') {
      throw new ForbiddenException('Réservé aux enseignants')
    }

    return user
  }

  /**
   * Vérifie que le chapitre appartient à un cours de l'enseignant
   */
  private async assertChapterOwner(chapterId: string, teacherId: string) {
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { course: { select: { instructorId: true } } },
    })

    if (!chapter || chapter.course.instructorId !== teacherId) {
      throw new NotFoundException('Chapitre non trouvé')
    }

    return chapter
  }

  /**
   * Vérifie que le quiz appartient à un chapitre d'un cours de l'enseignant
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
   * Crée un quiz
   */
  async create(clerkId: string, chapterId: string, dto: CreateQuizDto) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertChapterOwner(chapterId, teacher.id)

    const quiz = await this.prisma.quiz.create({
      data: {
        title: dto.title,
        description: dto.description || '',
        timeLimit: dto.timeLimit ?? null,
        passingScore: dto.passingScore ?? null,
        isPublished: dto.isPublished ?? false,
        shuffleQuestions: dto.shuffleQuestions ?? false,
        shuffleOptions: dto.shuffleOptions ?? false,
        chapterId,
        userId: teacher.id,
      },
    })

    this.logger.log(`Quiz créé: ${quiz.id} (chapitre ${chapterId})`)
    return quiz
  }

  /**
   * Liste les quiz d'un chapitre
   */
  async findAllByChapter(clerkId: string, chapterId: string) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertChapterOwner(chapterId, teacher.id)

    return this.prisma.quiz.findMany({
      where: { chapterId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: {
          select: { questions: true, attempts: true },
        },
      },
    })
  }

  /**
   * Récupère un quiz par ID
   */
  async findOne(clerkId: string, quizId: string) {
    const teacher = await this.getTeacher(clerkId)

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: { position: 'asc' },
          include: { options: true },
        },
        chapter: { select: { id: true, title: true, courseId: true } },
      },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz non trouvé')
    }

    // Vérifier la propriété
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: quiz.chapterId },
      select: { course: { select: { instructorId: true } } },
    })

    if (!chapter || chapter.course.instructorId !== teacher.id) {
      throw new NotFoundException('Quiz non trouvé')
    }

    return quiz
  }

  /**
   * Modifie un quiz
   */
  async update(clerkId: string, quizId: string, dto: UpdateQuizDto) {
    const teacher = await this.getTeacher(clerkId)
    const existing = await this.assertQuizOwner(quizId, teacher.id)

    const updated = await this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        title: dto.title ?? existing.title,
        description: dto.description ?? existing.description,
        timeLimit: dto.timeLimit !== undefined ? dto.timeLimit : existing.timeLimit,
        passingScore:
          dto.passingScore !== undefined ? dto.passingScore : existing.passingScore,
        isPublished: dto.isPublished ?? existing.isPublished,
        shuffleQuestions: dto.shuffleQuestions ?? existing.shuffleQuestions,
        shuffleOptions: dto.shuffleOptions ?? existing.shuffleOptions,
      },
    })

    this.logger.log(`Quiz mis à jour: ${quizId}`)
    return updated
  }

  /**
   * Publie ou dépublie un quiz
   */
  async publish(clerkId: string, quizId: string, dto: PublishQuizDto) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertQuizOwner(quizId, teacher.id)

    const updated = await this.prisma.quiz.update({
      where: { id: quizId },
      data: { isPublished: dto.isPublished },
    })

    this.logger.log(
      `Quiz ${dto.isPublished ? 'publié' : 'dépublié'}: ${quizId}`,
    )
    return updated
  }
  
    /**
   * Statistiques complètes d'un quiz
   */
  async getStatistiques(clerkId: string, quizId: string) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertQuizOwner(quizId, teacher.id)

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        chapter: {
          include: { course: true },
        },
        questions: {
          orderBy: { position: 'asc' },
          include: {
            options: true,
            answers: true,
          },
        },
        attempts: {
          include: {
            user: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                email: true,
              },
            },
            answers: {
              include: {
                question: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz non trouvé')
    }

    return quiz
  }

  // ⚠️ remove() volontairement non implémenté
  // Décision : ne pas exposer DELETE sur les quiz
  // pour protéger les tentatives et réponses des élèves
}