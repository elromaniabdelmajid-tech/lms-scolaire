import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { QuestionBanksService } from './question-banks.service'
import { CreateBankDto } from './dto/create-bank.dto'
import { UpdateBankDto } from './dto/update-bank.dto'
import { CreateBankQuestionDto } from './dto/create-bank-question.dto'
import { UpdateBankQuestionDto } from './dto/update-bank-question.dto'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller()
export class QuestionBanksController {
  constructor(private readonly banksService: QuestionBanksService) {}

  // ============================================================
  // BANQUES
  // ============================================================

  @Post('banks')
  async createBank(@CurrentUser() user: any, @Body() dto: CreateBankDto) {
    return this.banksService.createBank(user?.sub, dto)
  }

  @Get('banks')
  async findAllBanks(@CurrentUser() user: any) {
    return this.banksService.findAllBanks(user?.sub)
  }

  @Get('banks/:id')
  async findOneBank(@CurrentUser() user: any, @Param('id') id: string) {
    return this.banksService.findOneBank(user?.sub, id)
  }

  @Put('banks/:id')
  async updateBank(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateBankDto,
  ) {
    return this.banksService.updateBank(user?.sub, id, dto)
  }

  @Delete('banks/:id')
  async removeBank(@CurrentUser() user: any, @Param('id') id: string) {
    return this.banksService.removeBank(user?.sub, id)
  }

  // ============================================================
  // QUESTIONS DE BANQUE
  // ============================================================

  @Post('banks/:bankId/questions')
  async createBankQuestion(
    @CurrentUser() user: any,
    @Param('bankId') bankId: string,
    @Body() dto: CreateBankQuestionDto,
  ) {
    return this.banksService.createBankQuestion(user?.sub, bankId, dto)
  }

  @Get('banks/:bankId/questions')
  async findAllBankQuestions(
    @CurrentUser() user: any,
    @Param('bankId') bankId: string,
  ) {
    return this.banksService.findAllBankQuestions(user?.sub, bankId)
  }

  @Put('bank-questions/:id')
  async updateBankQuestion(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateBankQuestionDto,
  ) {
    return this.banksService.updateBankQuestion(user?.sub, id, dto)
  }

  @Delete('bank-questions/:id')
  async removeBankQuestion(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.banksService.removeBankQuestion(user?.sub, id)
  }
}