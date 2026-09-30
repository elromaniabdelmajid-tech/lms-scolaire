import type { Option } from './option'

export interface Question {
  id: string
  text: string
  type: string
  points: number
  position: number
  explanation: string | null
  svg: string | null
  createdAt: string
  updatedAt: string
  quizId: string
}

export interface QuestionWithOptions extends Question {
  options?: Option[]
}

export interface CreateQuestionDto {
  text: string
  type: string
  points?: number
  explanation?: string
  svg?: string
}

export interface UpdateQuestionDto extends Partial<CreateQuestionDto> {
  position?: number
}