import { Module } from '@nestjs/common'
import { QuizExportController } from './quiz-export.controller'
import { QuizExportService } from './quiz-export.service'

@Module({
  controllers: [QuizExportController],
  providers: [QuizExportService],
  exports: [QuizExportService],
})
export class QuizExportModule {}