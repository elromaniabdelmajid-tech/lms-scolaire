import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { CreateCourseDto } from './dto/create-course.dto'
import { UpdateCourseDto } from './dto/update-course.dto'

@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère l'utilisateur et vérifie qu'il est ENSEIGNANT
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
   * Crée un nouveau cours
   */
  async create(clerkId: string, dto: CreateCourseDto) {
    const teacher = await this.getTeacher(clerkId)

    const course = await this.prisma.course.create({
      data: {
        title: dto.title,
        description: dto.description || '',
        category: dto.category || null,
        level: dto.level || null,
        price: dto.price ? Number(dto.price) : 0,
        isPublished: dto.isPublished || false,
        instructorId: teacher.id,
      },
    })

    this.logger.log(`Cours créé: ${course.id} par ${teacher.id}`)
    return course
  }

  /**
   * Liste les cours de l'enseignant connecté
   */
  async findAllByTeacher(clerkId: string) {
    const teacher = await this.getTeacher(clerkId)

    return this.prisma.course.findMany({
      where: { instructorId: teacher.id },
      include: {
        chapters: true,
        enrollments: true,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  /**
   * Récupère un cours par ID (avec vérif propriétaire)
   */
  async findOne(clerkId: string, courseId: string) {
    const teacher = await this.getTeacher(clerkId)

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course || course.instructorId !== teacher.id) {
      throw new NotFoundException('Cours non trouvé')
    }

    return course
  }

  /**
   * Met à jour un cours
   */
  async update(clerkId: string, courseId: string, dto: UpdateCourseDto) {
    const teacher = await this.getTeacher(clerkId)

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course || course.instructorId !== teacher.id) {
      throw new NotFoundException('Cours non trouvé')
    }

    const updated = await this.prisma.course.update({
      where: { id: courseId },
      data: {
        title: dto.title,
        description: dto.description ?? course.description,
        category: dto.category ?? course.category,
        level: dto.level ?? course.level,
        price: dto.price !== undefined ? Number(dto.price) : course.price,
        isPublished: dto.isPublished ?? course.isPublished,
      },
    })

    this.logger.log(`Cours mis à jour: ${courseId}`)
    return updated
  }
  
  
  
    /**
   * Dashboard enseignant : cours + stats + inscriptions récentes
   */
  async getTeacherDashboard(clerkId: string) {
    const teacher = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, prenom: true, nom: true, role: true },
    })

    if (!teacher) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    if (teacher.role !== 'ENSEIGNANT') {
      throw new ForbiddenException('Réservé aux enseignants')
    }

    const courses = await this.prisma.course.findMany({
      where: { instructorId: teacher.id },
      include: {
        chapters: {
          where: { isPublished: true },
        },
        enrollments: {
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
      orderBy: { createdAt: 'desc' },
    })

    const totalCourses = courses.length
    const totalStudents = courses.reduce(
      (acc, c) => acc + c.enrollments.length,
      0,
    )
    const totalChapters = courses.reduce(
      (acc, c) => acc + c.chapters.length,
      0,
    )

    const recentEnrollments = courses
      .flatMap((c) =>
        c.enrollments.map((e) => ({ ...e, courseTitle: c.title })),
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)

    this.logger.log(`Dashboard enseignant: ${teacher.id}`)

    return {
      teacher,
      courses,
      stats: { totalCourses, totalStudents, totalChapters },
      recentEnrollments,
    }
  }


  /**
   * Supprime un cours
   */
 /* async remove(clerkId: string, courseId: string) {
    const teacher = await this.getTeacher(clerkId)

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course || course.instructorId !== teacher.id) {
      throw new NotFoundException('Cours non trouvé')
    }

    await this.prisma.course.delete({
      where: { id: courseId },
    })

    this.logger.log(`Cours supprimé: ${courseId}`)
    return { success: true }
  }*/
}