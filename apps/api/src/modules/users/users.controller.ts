import { Controller, Get } from '@nestjs/common'
import { UsersService } from './users.service'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return this.usersService.getMe(user?.sub)
  }
}