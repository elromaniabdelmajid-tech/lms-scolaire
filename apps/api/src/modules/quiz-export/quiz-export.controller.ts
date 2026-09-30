import {
  Body,
  Controller,
  Get,
  Header,
  Param,
  Post,
  Res,
} from '@nestjs/common'
import { Response } from 'express'
import { QuizExportService } from './quiz-export.service'
import { ImportBankDto } from './dto/import-bank.dto'
import { CurrentUser } from '../../core/auth/decorators/current-user.decorator'
import { Public } from '../../core/auth/decorators/public.decorator'
import { ImportCsvDto } from './dto/import-csv.dto'

@Controller('teacher/quizzes')
export class QuizExportController {
  constructor(private readonly service: QuizExportService) {}

  /**
   * Export PDF (données JSON)
   */
  @Get(':quizId/export')
  async exportQuiz(
    @CurrentUser() user: any,
    @Param('quizId') quizId: string,
  ) {
    return this.service.getExportData(user?.sub, quizId)
  }

  /**
   * Import depuis une banque de questions
   */
  @Post(':quizId/import-bank')
  async importFromBank(
    @CurrentUser() user: any,
    @Param('quizId') quizId: string,
    @Body() dto: ImportBankDto,
  ) {
    return this.service.importFromBank(user?.sub, quizId, dto)
  }

  /**
   * Télécharger le modèle CSV
   */
  @Public()
  @Get('csv-template')
  async getCsvTemplate(@Res() res: Response) {
    const csv = this.service.getCsvTemplate()
    const bom = '\uFEFF'

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="modele-quiz.csv"',
    )
    res.send(bom + csv)
  }
  @Post(':quizId/import-csv')
async importCsv(
  @CurrentUser() user: any,
  @Param('quizId') quizId: string,
  @Body() dto: ImportCsvDto,
) {
  return this.service.importCsv(user?.sub, quizId, dto)
}
}