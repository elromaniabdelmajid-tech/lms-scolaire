import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { ChaptersService } from './chapters.service'
import { CreateChapterDto } from './dto/create-chapter.dto'
import { UpdateChapterDto } from './dto/update-chapter.dto'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller()
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Post('courses/:courseId/chapters')
  async create(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Body() dto: CreateChapterDto,
  ) {
    return this.chaptersService.create(user?.sub, courseId, dto)
  }

  @Get('courses/:courseId/chapters')
  async findAllByCourse(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
  ) {
    return this.chaptersService.findAllByCourse(user?.sub, courseId)
  }

  @Get('chapters/:id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.chaptersService.findOne(user?.sub, id)
  }

  @Put('chapters/:id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateChapterDto,
  ) {
    return this.chaptersService.update(user?.sub, id, dto)
  }
}