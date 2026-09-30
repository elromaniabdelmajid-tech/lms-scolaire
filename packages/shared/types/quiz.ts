import type { Question } from './question'

export interface Quiz {
  id: string
  title: string
  description: string | null
  timeLimit: number | null
  passingScore: number | null
  isPublished: boolean
  shuffleQuestions: boolean
  shuffleOptions: boolean
  createdAt: string
  updatedAt: string
  chapterId: string
  userId: string
}

export interface QuizWithRelations extends Quiz {
  questions?: Question[]
  _count?: {
    questions: number
    attempts: number
  }
}

export interface CreateQuizDto {
  title: string
  description?: string
  timeLimit?: number
  passingScore?: number
  isPublished?: boolean
  shuffleQuestions?: boolean
  shuffleOptions?: boolean
}

export interface UpdateQuizDto extends Partial<CreateQuizDto> {}

export interface PublishQuizDto {
  isPublished: boolean
}