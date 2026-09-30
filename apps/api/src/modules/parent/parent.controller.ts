import { Controller, Get ,Param} from '@nestjs/common'
import { ParentService } from './parent.service'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'


@Controller('parent')
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  @Get('dashboard')
  async getDashboard(@CurrentUser() user: any) {
    return this.parentService.getDashboard(user?.sub)
  }
  
    @Get('children/:childId')
  async getChild(
    @CurrentUser() user: any,
    @Param('childId') childId: string,
  ) {
    return this.parentService.getChild(user?.sub, childId)
  }
}