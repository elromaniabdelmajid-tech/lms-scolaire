import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { CreateResourceDto } from './dto/create-resource.dto'
import { UpdateResourceDto } from './dto/update-resource.dto'

@Injectable()
export class ResourcesService {
  private readonly logger = new Logger(ResourcesService.name)

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
   * Vérifie que la ressource appartient à un chapitre de l'enseignant
   */
  private async assertResourceOwner(resourceId: string, teacherId: string) {
    const resource = await this.prisma.resource.findUnique({
      where: { id: resourceId },
      include: {
        chapter: {
          include: { course: { select: { instructorId: true } } },
        },
      },
    })

    if (!resource || resource.chapter.course.instructorId !== teacherId) {
      throw new NotFoundException('Ressource non trouvée')
    }

    return resource
  }

  /**
   * Crée une nouvelle ressource
   */
  async create(clerkId: string, chapterId: string, dto: CreateResourceDto) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertChapterOwner(chapterId, teacher.id)

    const resource = await this.prisma.resource.create({
      data: {
        title: dto.title,
        type: dto.type,
        url: dto.url,
        chapterId,
      },
    })

    this.logger.log(`Ressource créée: ${resource.id}`)
    return resource
  }

  /**
   * Liste les ressources d'un chapitre
   */
  async findAllByChapter(clerkId: string, chapterId: string) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertChapterOwner(chapterId, teacher.id)

    return this.prisma.resource.findMany({
      where: { chapterId },
      orderBy: { createdAt: 'asc' },
    })
  }

  /**
   * Récupère une ressource par ID
   */
  async findOne(clerkId: string, resourceId: string) {
    const teacher = await this.getTeacher(clerkId)
    return this.assertResourceOwner(resourceId, teacher.id)
  }

  /**
   * Modifie une ressource
   */
  async update(clerkId: string, resourceId: string, dto: UpdateResourceDto) {
    const teacher = await this.getTeacher(clerkId)
    const existing = await this.assertResourceOwner(resourceId, teacher.id)

    const updated = await this.prisma.resource.update({
      where: { id: resourceId },
      data: {
        title: dto.title ?? existing.title,
        type: dto.type ?? existing.type,
        url: dto.url ?? existing.url,
      },
    })

    this.logger.log(`Ressource mise à jour: ${resourceId}`)
    return updated
  }

  /**
   * Supprime une ressource
   */
  async remove(clerkId: string, resourceId: string) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertResourceOwner(resourceId, teacher.id)

    await this.prisma.resource.delete({
      where: { id: resourceId },
    })

    this.logger.log(`Ressource supprimée: ${resourceId}`)
    return { success: true }
  }
}