import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { ToggleProgressDto } from './dto/toggle-progress.dto'

@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name)

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
   * Vérifie que l'élève est inscrit au cours
   */
  private async assertEnrolled(studentId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId,
        },
      },
    })

    if (!enrollment) {
      throw new ForbiddenException('Non inscrit à ce cours')
    }

    return enrollment
  }

  /**
   * Toggle (marquer/démarquer) un chapitre comme terminé
   */
  async toggle(clerkId: string, dto: ToggleProgressDto) {
    const student = await this.getStudent(clerkId)
    await this.assertEnrolled(student.id, dto.courseId)

    // Vérifier que le chapitre existe et appartient au cours
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: dto.chapterId },
      select: { id: true, courseId: true },
    })

    if (!chapter || chapter.courseId !== dto.courseId) {
      throw new NotFoundException('Chapitre non trouvé')
    }

    // Upsert : créer ou mettre à jour la progression
    const progress = await this.prisma.progress.upsert({
      where: {
        userId_chapterId: {
          userId: student.id,
          chapterId: dto.chapterId,
        },
      },
      create: {
        userId: student.id,
        chapterId: dto.chapterId,
        isCompleted: dto.isCompleted,
        completedAt: dto.isCompleted ? new Date() : null,
      },
      update: {
        isCompleted: dto.isCompleted,
        completedAt: dto.isCompleted ? new Date() : null,
      },
    })

    this.logger.log(
      `Progression ${dto.isCompleted ? 'marquée' : 'démarquée'}: chapitre ${dto.chapterId}`,
    )

    // Mettre à jour la progression du cours
    await this.recalculateCourseProgress(student.id, dto.courseId)

    return progress
  }

  /**
   * Récupère la progression d'un élève sur un cours
   */
  async getByCourse(clerkId: string, courseId: string) {
    const student = await this.getStudent(clerkId)
    await this.assertEnrolled(student.id, courseId)

    const progress = await this.prisma.progress.findMany({
      where: {
        userId: student.id,
        chapter: { courseId },
      },
      include: {
        chapter: {
          select: { id: true, title: true, position: true },
        },
      },
    })

    return progress
  }

  /**
   * Recalcule et met à jour la progression globale du cours
   */
  private async recalculateCourseProgress(studentId: string, courseId: string) {
    // Compter les chapitres du cours
    const totalChapters = await this.prisma.chapter.count({
      where: { courseId },
    })

    if (totalChapters === 0) return

    // Compter les chapitres terminés
    const completedChapters = await this.prisma.progress.count({
      where: {
        userId: studentId,
        isCompleted: true,
        chapter: { courseId },
      },
    })

    const progressPercent = Math.round((completedChapters / totalChapters) * 100)

    // Mettre à jour l'inscription
    await this.prisma.enrollment.update({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId,
        },
      },
      data: {
        progress: progressPercent,
        completedAt: progressPercent === 100 ? new Date() : null,
      },
    })

    this.logger.log(
      `Progression cours recalculée: ${progressPercent}% (${completedChapters}/${totalChapters})`,
    )
  }
}