import {
  Body,
  Controller,
  Delete, 
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { QuestionsService } from './questions.service'
import { CreateQuestionDto } from './dto/create-question.dto'
import { UpdateQuestionDto } from './dto/update-question.dto'
import { CreateOptionDto } from './dto/create-option.dto'
import { UpdateOptionDto } from './dto/update-option.dto'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller()
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  // ============================================================
  // QUESTIONS
  // ============================================================

  @Post('quizzes/:quizId/questions')
  async createQuestion(
    @CurrentUser() user: any,
    @Param('quizId') quizId: string,
    @Body() dto: CreateQuestionDto,
  ) {
    return this.questionsService.createQuestion(user?.sub, quizId, dto)
  }

  @Get('quizzes/:quizId/questions')
  async findAllQuestionsByQuiz(
    @CurrentUser() user: any,
    @Param('quizId') quizId: string,
  ) {
    return this.questionsService.findAllQuestionsByQuiz(user?.sub, quizId)
  }

  @Get('questions/:id')
  async findOneQuestion(@CurrentUser() user: any, @Param('id') id: string) {
    return this.questionsService.findOneQuestion(user?.sub, id)
  }

  @Put('questions/:id')
  async updateQuestion(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateQuestionDto,
  ) {
    return this.questionsService.updateQuestion(user?.sub, id, dto)
  }

  // ============================================================
  // OPTIONS
  // ============================================================

  @Post('questions/:questionId/options')
  async createOption(
    @CurrentUser() user: any,
    @Param('questionId') questionId: string,
    @Body() dto: CreateOptionDto,
  ) {
    return this.questionsService.createOption(user?.sub, questionId, dto)
  }

  @Get('questions/:questionId/options')
  async findAllOptionsByQuestion(
    @CurrentUser() user: any,
    @Param('questionId') questionId: string,
  ) {
    return this.questionsService.findAllOptionsByQuestion(
      user?.sub,
      questionId,
    )
  }

  @Put('options/:id')
  async updateOption(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateOptionDto,
  ) {
    return this.questionsService.updateOption(user?.sub, id, dto)
  }
  
    @Delete('questions/:id')
  async deleteQuestion(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.questionsService.deleteQuestion(user?.sub, id)
  }

  @Delete('options/:id')
  async deleteOption(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.questionsService.deleteOption(user?.sub, id)
  }
  
}