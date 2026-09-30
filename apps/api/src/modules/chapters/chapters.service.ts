import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { CreateChapterDto } from './dto/create-chapter.dto'
import { UpdateChapterDto } from './dto/update-chapter.dto'

@Injectable()
export class ChaptersService {
  private readonly logger = new Logger(ChaptersService.name)

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
   * Vérifie que le cours appartient à l'enseignant
   */
  private async assertCourseOwner(courseId: string, teacherId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true, instructorId: true },
    })

    if (!course || course.instructorId !== teacherId) {
      throw new NotFoundException('Cours non trouvé')
    }

    return course
  }

  /**
   * Crée un chapitre (calcule la position automatiquement)
   */
  async create(clerkId: string, courseId: string, dto: CreateChapterDto) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertCourseOwner(courseId, teacher.id)

    // Calcul de la prochaine position
    const lastChapter = await this.prisma.chapter.findFirst({
      where: { courseId },
      orderBy: { position: 'desc' },
      select: { position: true },
    })

    const position = lastChapter ? lastChapter.position + 1 : 1

    const chapter = await this.prisma.chapter.create({
      data: {
        title: dto.title,
        description: dto.description || '',
        position,
        isFree: dto.isFree || false,
        isPublished: dto.isPublished || false,
        courseId,
      },
    })

    this.logger.log(`Chapitre créé: ${chapter.id} (position ${position})`)
    return chapter
  }

  /**
   * Liste les chapitres d'un cours
   */
  async findAllByCourse(clerkId: string, courseId: string) {
  // Récupérer l'utilisateur
  const user = await this.prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, role: true },
  })

  if (!user) {
    throw new NotFoundException('Utilisateur non trouvé')
  }

  // Vérifier que le cours existe
  const course = await this.prisma.course.findUnique({
    where: { id: courseId },
    select: { id: true, instructorId: true },
  })

  if (!course) {
    throw new NotFoundException('Cours non trouvé')
  }

  // ENSEIGNANT : doit être le propriétaire
  if (user.role === 'ENSEIGNANT') {
    if (course.instructorId !== user.id) {
      throw new NotFoundException('Cours non trouvé')
    }
    // Tous les chapitres
    return this.prisma.chapter.findMany({
      where: { courseId },
      orderBy: { position: 'asc' },
      include: {
        resources: true,
        quizzes: true,
      },
    })
  }

  // ELEVE : doit être inscrit
  if (user.role === 'ELEVE') {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId,
        },
      },
    })

    if (!enrollment) {
      throw new ForbiddenException('Non inscrit à ce cours')
    }

    // Seulement les chapitres publiés
    return this.prisma.chapter.findMany({
      where: { courseId, isPublished: true },
      orderBy: { position: 'asc' },
      include: {
        resources: true,
        quizzes: { where: { isPublished: true } },
      },
    })
  }

  throw new ForbiddenException('Accès refusé')
}

  /**
   * Récupère un chapitre par ID
   */
  async findOne(clerkId: string, chapterId: string) {
    const teacher = await this.getTeacher(clerkId)

    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { course: { select: { instructorId: true } } },
    })

    if (!chapter || chapter.course.instructorId !== teacher.id) {
      throw new NotFoundException('Chapitre non trouvé')
    }

    return chapter
  }

  /**
   * Modifie un chapitre
   */
  async update(clerkId: string, chapterId: string, dto: UpdateChapterDto) {
    const teacher = await this.getTeacher(clerkId)

    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      include: { course: { select: { instructorId: true } } },
    })

    if (!chapter || chapter.course.instructorId !== teacher.id) {
      throw new NotFoundException('Chapitre non trouvé')
    }

    const updated = await this.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        title: dto.title,
        description: dto.description ?? chapter.description,
        isFree: dto.isFree ?? chapter.isFree,
        isPublished: dto.isPublished ?? chapter.isPublished,
        ...(dto.position !== undefined && { position: dto.position }),
      },
    })

    this.logger.log(`Chapitre mis à jour: ${chapterId}`)
    return updated
  }

  // ⚠️ remove() volontairement non implémenté
  // Voir la décision : ne pas exposer DELETE sur les chapitres
  // pour éviter les suppressions en cascade (quiz, questions, progress élève)
}