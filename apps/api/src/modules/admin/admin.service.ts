import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name)

  constructor(private readonly prisma: PrismaService) {}

  private async getAdmin(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, prenom: true, nom: true, role: true },
    })

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Réservé aux administrateurs')
    }

    return user
  }

  async getDashboard(clerkId: string) {
    const admin = await this.getAdmin(clerkId)

    const [
      totalUsers,
      totalAdmins,
      totalTeachers,
      totalStudents,
      totalParents,
      totalCourses,
      totalPublishedCourses,
      totalChapters,
      totalQuizzes,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'ADMIN' } }),
      this.prisma.user.count({ where: { role: 'ENSEIGNANT' } }),
      this.prisma.user.count({ where: { role: 'ELEVE' } }),
      this.prisma.user.count({ where: { role: 'PARENT' } }),
      this.prisma.course.count(),
      this.prisma.course.count({ where: { isPublished: true } }),
      this.prisma.chapter.count(),
      this.prisma.quiz.count(),
    ])

    const recentUsers = await this.prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        prenom: true,
        nom: true,
        role: true,
        createdAt: true,
      },
    })

    const recentCourses = await this.prisma.course.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        instructor: {
          select: { prenom: true, nom: true, email: true },
        },
      },
    })

    this.logger.log(`Dashboard admin: ${admin.id}`)

    return {
      admin,
      stats: {
        totalUsers,
        totalAdmins,
        totalTeachers,
        totalStudents,
        totalParents,
        totalCourses,
        totalPublishedCourses,
        totalChapters,
        totalQuizzes,
      },
      recentUsers,
      recentCourses,
    }
  }
}