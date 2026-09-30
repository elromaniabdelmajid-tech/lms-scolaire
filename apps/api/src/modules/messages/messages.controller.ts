import { Body, Controller, Post } from '@nestjs/common'
import { MessagesService } from './messages.service'
import { CreateMessageDto } from './dto/create-message.dto'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(
    @CurrentUser() user: any,
    @Body() dto: CreateMessageDto,
  ) {
    const clerkId = user?.sub
    return this.messagesService.create(clerkId, dto)
  }
}