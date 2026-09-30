import type { ApiClient } from '../client'
import type {
  Quiz,
  QuizWithRelations,
  CreateQuizDto,
  UpdateQuizDto,
  PublishQuizDto,
} from '@lms-scolaire/shared'

export class QuizzesResource {
  constructor(private readonly client: ApiClient) {}

  async listByChapter(chapterId: string): Promise<QuizWithRelations[]> {
    return this.client.get<QuizWithRelations[]>(
      `/chapters/${chapterId}/quizzes`,
    )
  }

  async getById(id: string): Promise<QuizWithRelations> {
    return this.client.get<QuizWithRelations>(`/quizzes/${id}`)
  }

  async create(chapterId: string, dto: CreateQuizDto): Promise<Quiz> {
    return this.client.post<Quiz>(`/chapters/${chapterId}/quizzes`, dto)
  }

  async update(id: string, dto: UpdateQuizDto): Promise<Quiz> {
    return this.client.put<Quiz>(`/quizzes/${id}`, dto)
  }

  async publish(id: string, dto: PublishQuizDto): Promise<Quiz> {
    return this.client.patch<Quiz>(`/quizzes/${id}/publish`, dto)
  }
  
  
  
  /**
 * Importer des questions depuis une banque
 */
async importBank(
  quizId: string,
  bankId: string,
  questionIds: string[],
): Promise<{ success: boolean; imported: number }> {
  return this.client.post<{ success: boolean; imported: number }>(
    `/teacher/quizzes/${quizId}/import-bank`,
    { bankId, questionIds },
  )
}

async importCsv(
  quizId: string,
  questions: Array<{
    question: string
    type: string
    points: number
    svg?: string
    options: Array<{ text: string; isCorrect: boolean }>
  }>,
): Promise<{ success: boolean; imported: number }> {
  return this.client.post<{ success: boolean; imported: number }>(
    `/teacher/quizzes/${quizId}/import-csv`,
    { questions },
  )
}

/**
 * Récupère les données d'export PDF d'un quiz
 */
async getExportData(quizId: string): Promise<{
  quizTitle: string
  quizDescription: string | null
  courseName: string
  chapterName: string
  chapterId: string
  totalQuestions: number
  passingScore: number
  attempts: Array<{
    studentName: string
    studentEmail: string
    score: number
    completedAt: string
    passed: boolean
  }>
  questionStats: Array<{
    text: string
    successRate: number
    correctAnswers: number
    totalAnswers: number
  }>
}> {
  return this.client.get(`/teacher/quizzes/${quizId}/export`)
}

  async getStatistiques(id: string): Promise<any> {
    return this.client.get(`/quizzes/${id}/statistiques`)
  }
}