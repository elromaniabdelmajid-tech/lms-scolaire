import { Controller, Get } from '@nestjs/common'
import { CurrentUser } from './decorators/current-user.decorator'

@Controller('auth')
export class AuthController {
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return {
      message: 'Vous êtes authentifié',
      user: {
        clerkId: user?.sub,
      },
    }
  }
}