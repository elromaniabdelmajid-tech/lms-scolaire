import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import { ResourcesService } from './resources.service'
import { CreateResourceDto } from './dto/create-resource.dto'
import { UpdateResourceDto } from './dto/update-resource.dto'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller()
export class ResourcesController {
  constructor(private readonly resourcesService: ResourcesService) {}

  @Post('chapters/:chapterId/resources')
  async create(
    @CurrentUser() user: any,
    @Param('chapterId') chapterId: string,
    @Body() dto: CreateResourceDto,
  ) {
    return this.resourcesService.create(user?.sub, chapterId, dto)
  }

  @Get('chapters/:chapterId/resources')
  async findAllByChapter(
    @CurrentUser() user: any,
    @Param('chapterId') chapterId: string,
  ) {
    return this.resourcesService.findAllByChapter(user?.sub, chapterId)
  }

  @Get('resources/:id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.resourcesService.findOne(user?.sub, id)
  }

  @Put('resources/:id')
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateResourceDto,
  ) {
    return this.resourcesService.update(user?.sub, id, dto)
  }

  @Delete('resources/:id')
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.resourcesService.remove(user?.sub, id)
  }
}