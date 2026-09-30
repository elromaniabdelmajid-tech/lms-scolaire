import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { CreateMessageDto } from './dto/create-message.dto'

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crée un nouveau message dans une conversation
   */
  async create(clerkId: string, dto: CreateMessageDto) {
    // 1. Récupérer l'utilisateur
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    })

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    // 2. Vérifier que l'utilisateur participe à la conversation
    const participant = await this.prisma.conversationParticipant.findUnique({
      where: {
        userId_conversationId: {
          userId: user.id,
          conversationId: dto.conversationId,
        },
      },
    })

    if (!participant) {
      throw new ForbiddenException('Vous ne participez pas à cette conversation')
    }

    // 3. Créer le message
    const message = await this.prisma.message.create({
      data: {
        content: dto.content,
        userId: user.id,
        conversationId: dto.conversationId,
      },
    })

    // 4. Mettre à jour la date de la conversation
    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: { updatedAt: new Date() },
    })

    this.logger.log(`Message créé par ${user.id} dans la conversation ${dto.conversationId}`)

    return message
  }
}