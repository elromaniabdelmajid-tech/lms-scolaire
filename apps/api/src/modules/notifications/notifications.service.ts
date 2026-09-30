import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère l'utilisateur (élève ou enseignant)
   */
  private async getUser(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    return user
  }

  /**
   * Nombre de notifications non lues
   */
  async getUnreadCount(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      return { count: 0 }
    }

    const count = await this.prisma.notification.count({
      where: {
        userId: user.id,
        isRead: false,
      },
    })

    return { count }
  }

  /**
   * Liste les notifications de l'utilisateur
   */
  async findAll(clerkId: string) {
    const user = await this.getUser(clerkId)

    return this.prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(clerkId: string, notificationId: string) {
    const user = await this.getUser(clerkId)

    // Vérifier que la notification appartient à l'utilisateur
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
      select: { id: true, userId: true },
    })

    if (!notification || notification.userId !== user.id) {
      throw new NotFoundException('Notification non trouvée')
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    })

    this.logger.log(`Notification ${notificationId} marquée comme lue`)
    return updated
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(clerkId: string) {
    const user = await this.getUser(clerkId)

    const result = await this.prisma.notification.updateMany({
      where: {
        userId: user.id,
        isRead: false,
      },
      data: { isRead: true },
    })

    this.logger.log(
      `${result.count} notification(s) marquée(s) comme lue(s) pour user ${user.id}`,
    )

    return { success: true, count: result.count }
  }
}