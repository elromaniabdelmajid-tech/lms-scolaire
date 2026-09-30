import type { ApiClient } from '../client'
import type {
  Question,
  QuestionWithOptions,
  Option,
  CreateQuestionDto,
  UpdateQuestionDto,
  CreateOptionDto,
  UpdateOptionDto,
} from '@lms-scolaire/shared'

export class QuestionsResource {
  constructor(private readonly client: ApiClient) {}

  // ============================================================
  // QUESTIONS
  // ============================================================

  async listByQuiz(quizId: string): Promise<QuestionWithOptions[]> {
    return this.client.get<QuestionWithOptions[]>(`/quizzes/${quizId}/questions`)
  }

  async getById(id: string): Promise<QuestionWithOptions> {
    return this.client.get<QuestionWithOptions>(`/questions/${id}`)
  }

  async create(quizId: string, dto: CreateQuestionDto): Promise<Question> {
    return this.client.post<Question>(`/quizzes/${quizId}/questions`, dto)
  }

  async update(id: string, dto: UpdateQuestionDto): Promise<Question> {
    return this.client.put<Question>(`/questions/${id}`, dto)
  }
  // APRÈS update() dans la section QUESTIONS
async delete(id: string): Promise<{ success: boolean }> {
  return this.client.delete<{ success: boolean }>(`/questions/${id}`)
}


  // ============================================================
  // OPTIONS
  // ============================================================

  async listOptions(questionId: string): Promise<Option[]> {
    return this.client.get<Option[]>(`/questions/${questionId}/options`)
  }

  async createOption(questionId: string, dto: CreateOptionDto): Promise<Option> {
    return this.client.post<Option>(`/questions/${questionId}/options`, dto)
  }

  async updateOption(id: string, dto: UpdateOptionDto): Promise<Option> {
    return this.client.put<Option>(`/options/${id}`, dto)
  }
  
  // APRÈS updateOption() dans la section OPTIONS
async deleteOption(id: string): Promise<{ success: boolean }> {
  return this.client.delete<{ success: boolean }>(`/options/${id}`)
}
}