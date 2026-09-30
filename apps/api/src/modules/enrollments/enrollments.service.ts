import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { CreateEnrollmentDto } from './dto/create-enrollment.dto'

@Injectable()
export class EnrollmentsService {
  private readonly logger = new Logger(EnrollmentsService.name)

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

  // ============================================================
  // ENROLL
  // ============================================================

  /**
   * Inscrit un élève à un cours
   */
  async enroll(clerkId: string, dto: CreateEnrollmentDto) {
    const student = await this.getStudent(clerkId)

    // 1. Vérifier que le cours existe et est publié
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      select: { id: true, title: true, isPublished: true },
    })

    if (!course) {
      throw new NotFoundException('Cours introuvable')
    }

    if (!course.isPublished) {
      throw new ForbiddenException('Ce cours n\'est pas disponible')
    }

    // 2. Vérifier si déjà inscrit
    const existing = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId: course.id,
        },
      },
    })

    if (existing) {
      throw new ConflictException({
        message: 'Vous êtes déjà inscrit à ce cours',
        enrollment: existing,
      })
    }

    // 3. Créer l'inscription
    const enrollment = await this.prisma.enrollment.create({
      data: {
        userId: student.id,
        courseId: course.id,
        progress: 0,
      },
      include: {
        course: {
          select: { id: true, title: true },
        },
      },
    })

    this.logger.log(
      `Élève ${student.id} inscrit au cours ${course.id}`,
    )

    return {
      success: true,
      message: 'Inscription réussie',
      enrollment,
    }
  }

  // ============================================================
  // LIST
  // ============================================================

  /**
   * Liste les inscriptions de l'élève
   */
  async findAll(clerkId: string) {
    const student = await this.getStudent(clerkId)

    const enrollments = await this.prisma.enrollment.findMany({
      where: { userId: student.id },
      orderBy: { createdAt: 'desc' },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            image: true,
            category: true,
            level: true,
            instructor: {
              select: {
                prenom: true,
                nom: true,
              },
            },
          },
        },
      },
    })

    return enrollments
  }

  // ============================================================
  // DETAIL
  // ============================================================

  /**
   * Détail d'une inscription
   */
  async findOne(clerkId: string, courseId: string) {
    const student = await this.getStudent(clerkId)

    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    })

    if (!enrollment) {
      throw new NotFoundException('Inscription non trouvée')
    }

    return enrollment
  }

  // ============================================================
  // UNENROLL
  // ============================================================

  /**
   * Désinscrit un élève d'un cours (avec suppression des progressions)
   */
  async unenroll(clerkId: string, courseId: string) {
    const student = await this.getStudent(clerkId)

    // 1. Vérifier l'existence
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: student.id,
          courseId,
        },
      },
    })

    if (!enrollment) {
      throw new NotFoundException('Inscription non trouvée')
    }

    // 2. Supprimer en cascade (progress + enrollment)
    await this.prisma.$transaction([
      // Supprimer les progressions liées au cours
      this.prisma.progress.deleteMany({
        where: {
          userId: student.id,
          chapter: { courseId },
        },
      }),
      // Supprimer l'inscription
      this.prisma.enrollment.delete({
        where: {
          userId_courseId: {
            userId: student.id,
            courseId,
          },
        },
      }),
    ])

    this.logger.log(
      `Élève ${student.id} désinscrit du cours ${courseId}`,
    )

    return { success: true }
  }
}