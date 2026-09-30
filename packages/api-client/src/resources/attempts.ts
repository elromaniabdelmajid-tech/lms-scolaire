import type { ApiClient } from '../client'
import type {
  AttemptQuestionsData,
  CheckAnswerDto,
  CheckAnswerResult,
  SubmitAttemptDto,
  SubmitResult,
  AttemptResults,
} from '@lms-scolaire/shared'

export class AttemptsResource {
  constructor(private readonly client: ApiClient) {}

  /**
   * Démarrer une tentative de quiz
   */
  async start(quizId: string): Promise<{ attemptId: string }> {
    return this.client.post<{ attemptId: string }>(
      `/student/quizzes/${quizId}/start`,
    )
  }

  /**
   * Récupérer les questions d'une tentative
   */
  async getQuestions(attemptId: string): Promise<AttemptQuestionsData> {
    return this.client.get<AttemptQuestionsData>(
      `/student/attempts/${attemptId}/questions`,
    )
  }

  /**
   * Vérifier une réponse (sans la sauvegarder)
   */
  async check(
    attemptId: string,
    dto: CheckAnswerDto,
  ): Promise<CheckAnswerResult> {
    return this.client.post<CheckAnswerResult>(
      `/student/attempts/${attemptId}/check`,
      dto,
    )
  }

  /**
   * Soumettre les réponses du quiz
   */
  async submit(
    attemptId: string,
    dto: SubmitAttemptDto,
  ): Promise<SubmitResult> {
    return this.client.post<SubmitResult>(
      `/student/attempts/${attemptId}/submit`,
      dto,
    )
  }

  /**
   * Récupérer les résultats d'une tentative
   */
  async getResults(attemptId: string): Promise<AttemptResults> {
    return this.client.get<AttemptResults>(
      `/student/attempts/${attemptId}/results`,
    )
  }
}