import { Body, Controller, Get, Param, Post } from '@nestjs/common'
import { ProgressService } from './progress.service'
import { ToggleProgressDto } from './dto/toggle-progress.dto'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller('student/progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post()
  async toggle(@CurrentUser() user: any, @Body() dto: ToggleProgressDto) {
    return this.progressService.toggle(user?.sub, dto)
  }

  @Get(':courseId')
  async getByCourse(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
  ) {
    return this.progressService.getByCourse(user?.sub, courseId)
  }
}