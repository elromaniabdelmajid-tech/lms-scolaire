import { Global, Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ClerkAuthGuard } from './guards/clerk-auth.guard'
import { AuthController } from './auth.controller'

@Global()
@Module({
  controllers: [AuthController],
  providers: [AuthService, ClerkAuthGuard],
  exports: [AuthService, ClerkAuthGuard],
})
export class AuthModule {}