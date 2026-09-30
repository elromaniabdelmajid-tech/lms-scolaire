import { Controller, Get } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Public } from '../auth/decorators/public.decorator'

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Public()
  @Get()
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'lms-api',
      version: '0.1.0',
    }
  }

  @Public()
  @Get('db')
  async checkDb() {
    const userCount = await this.prisma.user.count()
    const courseCount = await this.prisma.course.count()
    return {
      status: 'ok',
      database: 'connected',
      stats: { users: userCount, courses: courseCount },
    }
  }

  // ⬇️ AJOUTER CETTE MÉTHODE
  @Public()
  @Get('banks-test')
  async banksTest() {
    try {
      const count = await this.prisma.questionBank.count()
      const bankCount = await this.prisma.bankQuestion.count()
      return { ok: true, banks: count, bankQuestions: bankCount }
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'Unknown' }
    }
  }
}