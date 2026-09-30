export interface QuestionBank {
  id: string
  name: string
  description: string | null
  subject: string | null
  level: string | null
  isPublic: boolean
  createdAt: string
  updatedAt: string
  userId: string
}

export interface QuestionBankWithCount extends QuestionBank {
  question_count?: number
  _count?: {
    questions: number
  }
}

export interface BankQuestion {
  id: string
  text: string
  type: string
  points: number
  explanation: string | null
  options: any  // Json
  tags: string[]
  createdAt: string
  updatedAt: string
  bankId: string
}

// ============================================================
// DTOs
// ============================================================

export interface CreateBankDto {
  name: string
  description?: string
  subject?: string
  level?: string
  isPublic?: boolean
}

export interface UpdateBankDto extends Partial<CreateBankDto> {}

export interface CreateBankQuestionDto {
  text: string
  type?: string
  points?: number
  explanation?: string
  options?: any[]
  tags?: string[]
}

export interface UpdateBankQuestionDto extends Partial<CreateBankQuestionDto> {}