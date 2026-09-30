import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common'
import { QuizzesService } from './quizzes.service'
import { CreateQuizDto } from './dto/create-quiz.dto'
import { UpdateQuizDto } from './dto/update-quiz.dto'
import { PublishQuizDto } from './dto/publish-quiz.dto'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller()
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Post('chapters/:chapterId/quizzes')
  async create(
    @CurrentUser() user: any,
    @Param('chapterId') chapterId: string,
    @Body() dto: CreateQuizDto,
  ) {
    return this.quizzesService.create(user?.sub, chapterId, dto)
  }

  @Get('chapters/:chapterId/quizzes')
  async findAllByChapter(
    @CurrentUser() user: any,
    @Param('chapterId') chapterId: string,
  ) {
    return this.quizzesService.findAllByChapter(user?.sub, chapterId)
  }
  
  
    @Get('quizzes/:id/statistiques')
  async getStatistiques(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.quizzesService.getStatistiques(user?.sub, id)
  }

  @Get('quizzes/:id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.quizzesService.findOne(user?.sub, id)
  }
  
  

  @Put('quizzes/:id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateQuizDto,
  ) {
    return this.quizzesService.update(user?.sub, id, dto)
  }

  @Patch('quizzes/:id/publish')
  async publish(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: PublishQuizDto,
  ) {
    return this.quizzesService.publish(user?.sub, id, dto)
  }
}