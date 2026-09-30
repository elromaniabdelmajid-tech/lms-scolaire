import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'

@Injectable()
export class ParentService {
  private readonly logger = new Logger(ParentService.name)

  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(clerkId: string) {
  const parent = await this.prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, prenom: true, nom: true, role: true },
  })

  if (!parent) {
    throw new NotFoundException('Utilisateur non trouvé')
  }

  if (parent.role !== 'PARENT') {
    throw new ForbiddenException('Réservé aux parents')
  }

  const children = await this.prisma.user.findMany({
    where: {
      parentId: parent.id,
      role: 'ELEVE',
    },
    include: {
      enrollments: {
        include: {
          course: {
            include: {
              chapters: {
                where: { isPublished: true },
                select: { id: true },
              },
            },
          },
        },
      },
    },
  })

  // Calculs corrects
  const totalChildren = children.length
  let totalCourses = 0
  let totalChaptersCompleted = 0
  let totalChapters = 0

  for (const child of children) {
    totalCourses += child.enrollments.length
    for (const e of child.enrollments) {
      const chaptersInCourse = e.course.chapters.length
      totalChapters += chaptersInCourse
      // progress = pourcentage (0-100) → chapitres terminés = (progress/100) * total
      totalChaptersCompleted += Math.round(
        (e.progress / 100) * chaptersInCourse,
      )
    }
  }

  const overallProgress =
    totalChapters > 0
      ? Math.min(Math.round((totalChaptersCompleted / totalChapters) * 100), 100)
      : 0

  this.logger.log(`Dashboard parent: ${parent.id}`)

  return {
    parent,
    children,
    stats: {
      totalChildren,
      totalCourses,
      totalChaptersCompleted,
      overallProgress,
    },
  }
}
    async getChild(clerkId: string, childId: string) {
    const parent = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!parent) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    if (parent.role !== 'PARENT') {
      throw new ForbiddenException('Réservé aux parents')
    }

    const child = await this.prisma.user.findFirst({
      where: {
        id: childId,
        parentId: parent.id,
      },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                chapters: {
                  where: { isPublished: true },
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    })

    if (!child) {
      throw new NotFoundException('Enfant non trouvé')
    }

    return { child }
  }
}