import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        email: true,
        prenom: true,
        nom: true,
        role: true,
      },
    })

    if (!user) {
      throw new NotFoundException('Utilisateur non trouvé')
    }

    return user
  }
}