import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../core/prisma/prisma.service'
import { CreateBankDto } from './dto/create-bank.dto'
import { UpdateBankDto } from './dto/update-bank.dto'
import { CreateBankQuestionDto } from './dto/create-bank-question.dto'
import { UpdateBankQuestionDto } from './dto/update-bank-question.dto'

@Injectable()
export class QuestionBanksService {
  private readonly logger = new Logger(QuestionBanksService.name)

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Récupère l'utilisateur ENSEIGNANT
   */
  private async getTeacher(clerkId: string) {
    const user = await this.prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true },
    })

    if (!user) throw new NotFoundException('Utilisateur non trouvé')
    if (user.role !== 'ENSEIGNANT')
      throw new ForbiddenException('Réservé aux enseignants')

    return user
  }

  /**
   * Vérifie que la banque appartient à l'enseignant
   */
  private async assertBankOwner(bankId: string, teacherId: string) {
    const bank = await this.prisma.questionBank.findUnique({
      where: { id: bankId },
    })

    if (!bank || bank.userId !== teacherId) {
      throw new NotFoundException('Banque non trouvée')
    }

    return bank
  }

  /**
   * Vérifie que la question de banque appartient à l'enseignant
   */
  private async assertBankQuestionOwner(questionId: string, teacherId: string) {
    const question = await this.prisma.bankQuestion.findUnique({
      where: { id: questionId },
      include: { bank: { select: { userId: true } } },
    })

    if (!question || question.bank.userId !== teacherId) {
      throw new NotFoundException('Question non trouvée')
    }

    return question
  }

  // ============================================================
  // BANQUES
  // ============================================================

  async createBank(clerkId: string, dto: CreateBankDto) {
    const teacher = await this.getTeacher(clerkId)

    const bank = await this.prisma.questionBank.create({
      data: {
        name: dto.name,
        description: dto.description ?? null,
        subject: dto.subject ?? null,
        level: dto.level ?? null,
        isPublic: dto.isPublic ?? false,
        userId: teacher.id,
      },
    })

    this.logger.log(`Banque créée: ${bank.id}`)
    return bank
  }

  async findAllBanks(clerkId: string) {
    const teacher = await this.getTeacher(clerkId)

    const banks = await this.prisma.questionBank.findMany({
      where: {
        OR: [{ userId: teacher.id }, { isPublic: true }],
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { questions: true } },
      },
    })

    return banks.map((bank) => ({
      ...bank,
      question_count: bank._count.questions,
      _count: undefined,
    }))
  }

  async findOneBank(clerkId: string, bankId: string) {
    const teacher = await this.getTeacher(clerkId)

    const bank = await this.prisma.questionBank.findUnique({
      where: { id: bankId },
      include: {
        _count: { select: { questions: true } },
      },
    })

    if (!bank) {
      throw new NotFoundException('Banque non trouvée')
    }

    // Autoriser si propriétaire OU publique
    if (bank.userId !== teacher.id && !bank.isPublic) {
      throw new ForbiddenException('Accès refusé')
    }

    return bank
  }

  async updateBank(clerkId: string, bankId: string, dto: UpdateBankDto) {
    const teacher = await this.getTeacher(clerkId)
    const bank = await this.assertBankOwner(bankId, teacher.id)

    const updated = await this.prisma.questionBank.update({
      where: { id: bankId },
      data: {
        name: dto.name ?? bank.name,
        description: dto.description ?? bank.description,
        subject: dto.subject ?? bank.subject,
        level: dto.level ?? bank.level,
        isPublic: dto.isPublic ?? bank.isPublic,
      },
    })

    this.logger.log(`Banque mise à jour: ${bankId}`)
    return updated
  }

  async removeBank(clerkId: string, bankId: string) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertBankOwner(bankId, teacher.id)

    // Supprimer les questions puis la banque (transaction)
    await this.prisma.$transaction([
      this.prisma.bankQuestion.deleteMany({ where: { bankId } }),
      this.prisma.questionBank.delete({ where: { id: bankId } }),
    ])

    this.logger.log(`Banque supprimée: ${bankId}`)
    return { success: true }
  }

  // ============================================================
  // QUESTIONS DE BANQUE
  // ============================================================

  async createBankQuestion(
    clerkId: string,
    bankId: string,
    dto: CreateBankQuestionDto,
  ) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertBankOwner(bankId, teacher.id)

    const question = await this.prisma.bankQuestion.create({
      data: {
        text: dto.text,
        type: dto.type ?? 'SINGLE_CHOICE',
        points: dto.points ?? 1,
        explanation: dto.explanation ?? null,
        options: dto.options ?? [],
        tags: dto.tags ?? [],
        bankId,
      },
    })

    this.logger.log(`Question de banque créée: ${question.id}`)
    return question
  }

  async findAllBankQuestions(clerkId: string, bankId: string) {
    const teacher = await this.getTeacher(clerkId)

    const bank = await this.prisma.questionBank.findUnique({
      where: { id: bankId },
    })

    if (!bank) throw new NotFoundException('Banque non trouvée')
    if (bank.userId !== teacher.id && !bank.isPublic) {
      throw new ForbiddenException('Accès refusé')
    }

    return this.prisma.bankQuestion.findMany({
      where: { bankId },
      orderBy: { createdAt: 'desc' },
    })
  }

 
  async updateBankQuestion(
  clerkId: string,
  questionId: string,
  dto: UpdateBankQuestionDto,
) {
  const teacher = await this.getTeacher(clerkId)
  const question = await this.assertBankQuestionOwner(questionId, teacher.id)

  const updated = await this.prisma.bankQuestion.update({
    where: { id: questionId },
    data: {
      text: dto.text ?? question.text,
      type: dto.type ?? question.type,
      points: dto.points ?? question.points,
      explanation:
        dto.explanation !== undefined ? dto.explanation : question.explanation,
      ...(dto.options !== undefined && { options: dto.options }),
      tags: dto.tags ?? question.tags,
    },
  })

  this.logger.log(`Question de banque mise à jour: ${questionId}`)
  return updated
}

  async removeBankQuestion(clerkId: string, questionId: string) {
    const teacher = await this.getTeacher(clerkId)
    await this.assertBankQuestionOwner(questionId, teacher.id)

    await this.prisma.bankQuestion.delete({
      where: { id: questionId },
    })

    this.logger.log(`Question de banque supprimée: ${questionId}`)
    return { success: true }
  }
}