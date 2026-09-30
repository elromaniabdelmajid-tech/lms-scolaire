import type { Resource } from './resource'
import type { Quiz } from './quiz'

export interface Chapter {
  id: string
  title: string
  description: string | null
  videoUrl: string | null
  position: number
  isPublished: boolean
  isFree: boolean
  duration: number | null
  createdAt: string
  updatedAt: string
  courseId: string
}

export interface ChapterWithRelations extends Chapter {
  resources?: Resource[]
  quizzes?: Quiz[]
}

// ============================================================
// DTOs
// ============================================================

export interface CreateChapterDto {
  title: string
  description?: string
  isFree?: boolean
  isPublished?: boolean
}

export interface UpdateChapterDto extends Partial<CreateChapterDto> {
  position?: number
}