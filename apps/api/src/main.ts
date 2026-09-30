import { NestFactory } from '@nestjs/core'
import { ValidationPipe, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('Bootstrap')
  const app = await NestFactory.create(AppModule)

  const configService = app.get(ConfigService)
  const port = configService.get<number>('PORT', 5000)
  const frontendUrl = configService.get<string>('FRONTEND_URL', 'http://localhost:3000')

  // Validation globale
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // CORS
  app.enableCors({
    origin: frontendUrl.split(',').map((url) => url.trim()),
    credentials: true,
  })

  // Préfixe global API
  app.setGlobalPrefix('api')

  await app.listen(port)
  logger.log(`🚀 API NestJS démarrée sur http://localhost:${port}/api`)
}

bootstrap()