import { Controller, Get, Param, Post, Put } from '@nestjs/common'
import { NotificationsService } from './notifications.service'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Nombre de notifications non lues
   */
  @Get('unread-count')
  async getUnreadCount(@CurrentUser() user: any) {
    return this.notificationsService.getUnreadCount(user?.sub)
  }

  /**
   * Liste des notifications
   */
  @Get()
  async findAll(@CurrentUser() user: any) {
    return this.notificationsService.findAll(user?.sub)
  }

  /**
   * Marquer une notification comme lue
   */
  @Put(':id/read')
  async markAsRead(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(user?.sub, id)
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  @Post('mark-all-read')
  async markAllAsRead(@CurrentUser() user: any) {
    return this.notificationsService.markAllAsRead(user?.sub)
  }
}