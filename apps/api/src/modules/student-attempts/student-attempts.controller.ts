import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { StudentAttemptsService } from './student-attempts.service'
import { StartAttemptDto } from './dto/start-attempt.dto'
import { CheckAnswerDto } from './dto/check-answer.dto'
import { SubmitAttemptDto } from './dto/submit-attempt.dto'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller('student')
export class StudentAttemptsController {
  constructor(private readonly service: StudentAttemptsService) {}

  @Post('quizzes/:quizId/start')
  async start(
    @CurrentUser() user: any,
    @Param('quizId') quizId: string,
  ) {
    return this.service.start(user?.sub, quizId)
  }

  @Get('attempts/:id/questions')
  async getQuestions(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.getQuestions(user?.sub, id)
  }

  @Post('attempts/:id/check')
  async check(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: CheckAnswerDto,
  ) {
    return this.service.check(user?.sub, id, dto)
  }

  @Post('attempts/:id/submit')
  async submit(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: SubmitAttemptDto,
  ) {
    return this.service.submit(user?.sub, id, dto)
  }

  @Get('attempts/:id/results')
  async getResults(@CurrentUser() user: any, @Param('id') id: string) {
    return this.service.getResults(user?.sub, id)
  }
}