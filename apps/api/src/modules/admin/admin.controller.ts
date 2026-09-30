import { Controller, Get } from '@nestjs/common'
import { AdminService } from './admin.service'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    return this.adminService.getDashboard(user?.sub)
  }
}