import type { ApiClient } from '../client'
import type {
  QuestionBank,
  QuestionBankWithCount,
  BankQuestion,
  CreateBankDto,
  UpdateBankDto,
  CreateBankQuestionDto,
  UpdateBankQuestionDto,
} from '@lms-scolaire/shared'

export class BanksResource {
  constructor(private readonly client: ApiClient) {}

  // ============================================================
  // BANQUES
  // ============================================================

  async list(): Promise<QuestionBankWithCount[]> {
    return this.client.get<QuestionBankWithCount[]>('/banks')
  }

  async getById(id: string): Promise<QuestionBankWithCount> {
    return this.client.get<QuestionBankWithCount>(`/banks/${id}`)
  }

  async create(dto: CreateBankDto): Promise<QuestionBank> {
    return this.client.post<QuestionBank>('/banks', dto)
  }

  async update(id: string, dto: UpdateBankDto): Promise<QuestionBank> {
    return this.client.put<QuestionBank>(`/banks/${id}`, dto)
  }

  async delete(id: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/banks/${id}`)
  }

  // ============================================================
  // QUESTIONS DE BANQUE
  // ============================================================

  async listQuestions(bankId: string): Promise<BankQuestion[]> {
    return this.client.get<BankQuestion[]>(`/banks/${bankId}/questions`)
  }

  async createQuestion(
    bankId: string,
    dto: CreateBankQuestionDto,
  ): Promise<BankQuestion> {
    return this.client.post<BankQuestion>(`/banks/${bankId}/questions`, dto)
  }

  async updateQuestion(
    id: string,
    dto: UpdateBankQuestionDto,
  ): Promise<BankQuestion> {
    return this.client.put<BankQuestion>(`/bank-questions/${id}`, dto)
  }

  async deleteQuestion(id: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/bank-questions/${id}`)
  }
}