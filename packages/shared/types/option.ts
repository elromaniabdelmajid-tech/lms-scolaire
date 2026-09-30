export interface Option {
  id: string
  text: string
  isCorrect: boolean
  position: number
  createdAt: string
  updatedAt: string
  questionId: string
}

// ============================================================
// DTOs
// ============================================================

export interface CreateOptionDto {
  text: string
  isCorrect?: boolean
}

export interface UpdateOptionDto extends Partial<CreateOptionDto> {
  position?: number
}