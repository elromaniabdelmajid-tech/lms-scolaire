import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verifyToken } from '@clerk/backend'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)
  private readonly clerkSecretKey: string

  constructor(private readonly config: ConfigService) {
    this.clerkSecretKey = this.config.getOrThrow<string>('CLERK_SECRET_KEY')
  }

  async verifyToken(token: string) {
    try {
      const payload = await verifyToken(token, {
        secretKey: this.clerkSecretKey,
        // ⚠️ Timeout court pour éviter les blocages
        // jwtKey: ... (optionnel si vous voulez éviter l'appel réseau)
      })

      this.logger.debug(`✅ Token valide pour: ${payload.sub}`)
      return payload
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown'
      this.logger.warn(`❌ verifyToken a échoué: ${errorMsg}`)
      return null
    }
  }
}