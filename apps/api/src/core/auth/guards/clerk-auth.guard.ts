import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthService } from '../auth.service'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true

    const request = context.switchToHttp().getRequest()
    const authHeader = request.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant')
    }

    const token = authHeader.substring(7)
    const payload = await this.authService.verifyToken(token)

    if (!payload) {
      throw new UnauthorizedException('Token invalide')
    }

    request.user = payload
    return true
  }
}