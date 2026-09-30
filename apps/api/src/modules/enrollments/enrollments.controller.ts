import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
} from '@nestjs/common'
import { EnrollmentsService } from './enrollments.service'
import { CreateEnrollmentDto } from './dto/create-enrollment.dto'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller('student/enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  async enroll(@CurrentUser() user: any, @Body() dto: CreateEnrollmentDto) {
    return this.enrollmentsService.enroll(user?.sub, dto)
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.enrollmentsService.findAll(user?.sub)
  }

  @Get(':courseId')
  async findOne(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentsService.findOne(user?.sub, courseId)
  }

  @Delete(':courseId')
  async unenroll(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
  ) {
    return this.enrollmentsService.unenroll(user?.sub, courseId)
  }
}