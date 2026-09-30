import {
  Body,
  Controller,
  //Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { CoursesService } from './courses.service'
import { CreateCourseDto } from './dto/create-course.dto'
import { UpdateCourseDto } from './dto/update-course.dto'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  async create(@CurrentUser() user: any, @Body() dto: CreateCourseDto) {
    return this.coursesService.create(user?.sub, dto)
  }

  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.coursesService.findAllByTeacher(user?.sub)
  }
  @Get('enseignant/dashboard')
async getTeacherDashboard(@CurrentUser() user: any) {
  return this.coursesService.getTeacherDashboard(user?.sub)
}

  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.coursesService.findOne(user?.sub, id)
  }

  @Put(':id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateCourseDto,
  ) {
    return this.coursesService.update(user?.sub, id, dto)
  }
  
 
 // @Delete(':id')
 // async remove(@CurrentUser() user: any, @Param('id') id: string) {
  //  return this.coursesService.remove(user?.sub, id)
  //}
}