import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'

@Injectable()
export class StudentService {
  private readonly logger = new Logger(StudentService.name)

  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(clerkId: string) {
    const student = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, prenom: true, nom: true, email: true, role: true },
    })

    if (!student) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    if (student.role !== 'ELEVE') {
      throw new ForbiddenException('Réservé aux élèves')
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: student.id },
      include: {
        course: {
          include: {
            chapters: {
              where: { isPublished: true },
            },
          },
        },
      },
    })

    const allCourses = await this.prisma.course.findMany({
      where: { isPublished: true },
      include: {
        chapters: {
          where: { isPublished: true },
          select: { id: true },
        },
        enrollments: {
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Compter les messages non lus
    const unreadMessages = await this.prisma.message.count({
      where: {
        isRead: false,
        userId: { not: student.id },
        conversation: {
          participants: {
            some: { userId: student.id },
          },
        },
      },
    })

    this.logger.log(`Dashboard élève: ${student.id}`)

    return {
      student,
      enrollments,
      allCourses,
      unreadMessages,
    }
  }
  
    async getCourseForStudent(clerkId: string, courseId: string) {
    const student = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!student) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    if (student.role !== 'ELEVE') {
      throw new ForbiddenException('Réservé aux élèves')
    }

    // Vérifier l'inscription
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId,
        },
      },
    })

    if (!enrollment) {
      throw new ForbiddenException("Vous n'êtes pas inscrit à ce cours")
    }

    // Récupérer le cours avec toutes les relations
    const course = await this.prisma.course.findUnique({
      where: { id: courseId, isPublished: true },
      include: {
        chapters: {
          where: { isPublished: true },
          orderBy: { position: 'asc' },
          include: {
            resources: true,
            quizzes: {
              where: { isPublished: true },
              select: { id: true, title: true },
            },
            progress: {
              where: { userId: student.id },
            },
          },
        },
        instructor: {
          select: { prenom: true, nom: true },
        },
      },
    })

    if (!course) {
      throw new NotFoundException('Cours non trouvé')
    }

    return { course, enrollment }
  }
  
    async getChapterForStudent(clerkId: string, chapterId: string) {
    const student = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!student) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    if (student.role !== 'ELEVE') {
      throw new ForbiddenException('Réservé aux élèves')
    }

    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId, isPublished: true },
      include: {
        course: {
          select: { id: true, title: true },
        },
        resources: true,
      },
    })

    if (!chapter) {
      throw new NotFoundException('Chapitre non trouvé')
    }

    // Vérifier l'inscription de l'élève
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: chapter.course.id,
        },
      },
    })

    if (!enrollment) {
      throw new ForbiddenException("Vous n'êtes pas inscrit à ce cours")
    }

    return chapter
  }
  
    async getQuizForStudent(clerkId: string, quizId: string) {
    const student = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!student) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    if (student.role !== 'ELEVE') {
      throw new ForbiddenException('Réservé aux élèves')
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId, isPublished: true },
      include: {
        chapter: {
          include: { course: true },
        },
        questions: {
          orderBy: { position: 'asc' },
          include: {
            options: { orderBy: { position: 'asc' } },
          },
        },
      },
    })

    if (!quiz) {
      throw new NotFoundException('Quiz non trouvé')
    }

    // Vérifier l'inscription
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: quiz.chapter.course.id,
        },
      },
    })

    if (!enrollment) {
      throw new ForbiddenException("Vous n'êtes pas inscrit à ce cours")
    }

    // Vérifier tentative existante
    const existingAttempt = await this.prisma.quizAttempt.findFirst({
      where: {
        userId: student.id,
        quizId: quiz.id,
        completedAt: { not: null },
      },
      orderBy: { createdAt: 'desc' },
    })

    return { quiz, existingAttempt }
  }
  
    async getConversationsForStudent(clerkId: string) {
    const student = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!student) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    if (student.role !== 'ELEVE') {
      throw new ForbiddenException('Réservé aux élèves')
    }

    const conversations = await this.prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: student.id },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                email: true,
                role: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            user: {
              select: { prenom: true, nom: true },
            },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const unreadCount = await this.prisma.message.count({
      where: {
        isRead: false,
        userId: { not: student.id },
        conversation: {
          participants: {
            some: { userId: student.id },
          },
        },
      },
    })

    return {
      conversations: conversations.map((c) => ({
        id: c.id,
        title: c.title,
        participants: c.participants,
        lastMessage: c.messages[0] || null,
      })),
      unreadCount,
    }
  }
    async getConversationForStudent(clerkId: string, conversationId: string) {
    const student = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!student) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    if (student.role !== 'ELEVE') {
      throw new ForbiddenException('Réservé aux élèves')
    }

    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: student.id,
          conversationId,
        },
      },
    })

    if (!participant) {
      throw new ForbiddenException('Accès refusé')
    }

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                prenom: true,
                nom: true,
                email: true,
                role: true,
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      throw new NotFoundException('Conversation non trouvée')
    }

    const rawMessages = await this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            prenom: true,
            nom: true,
            role: true,
          },
        },
      },
    })

    const messages = rawMessages.map((m) => ({
      id: m.id,
      content: m.content,
      userId: m.userId,
      createdAt: m.createdAt,
      prenom: m.user.prenom || '',
      nom: m.user.nom || '',
      role: m.user.role,
    }))

    return {
      conversation,
      messages,
      currentUserId: student.id,
    }
  }
  
    async getGamificationForStudent(clerkId: string) {
    const student = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!student) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    if (student.role !== 'ELEVE') {
      throw new ForbiddenException('Réservé aux élèves')
    }

    // XP et niveau
    const xp = await this.prisma.xP.findUnique({
      where: { userId: student.id },
    })

    const totalXP = xp?.points ?? 0
    const level = xp?.level ?? 1

    // Badges débloqués
    const userBadgesRaw = await this.prisma.userBadge.findMany({
      where: { userId: student.id },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    })

    const userBadges = userBadgesRaw.map((ub) => ({
      id: ub.badge.id,
      name: ub.badge.name,
      description: ub.badge.description,
      icon: ub.badge.icon,
      category: ub.badge.category,
      earnedAt: ub.earnedAt,
    }))

    // Tous les badges
    const allBadges = await this.prisma.badge.findMany({
      orderBy: { category: 'asc' },
    })

    return {
      totalXP,
      level,
      userBadges,
      allBadges,
    }
  }
}