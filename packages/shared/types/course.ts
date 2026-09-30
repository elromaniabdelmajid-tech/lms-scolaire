import type { Niveau } from './user'

export interface Course {
  id: string
  title: string
  description: string | null
  image: string | null
  price: number | null
  isPublished: boolean
  category: string | null
  level: Niveau | string | null
  createdAt: string
  updatedAt: string
  instructorId: string
}

export interface CourseWithRelations extends Course {
  chapters?: ChapterWithRelations[]
  enrollments?: EnrollmentSummary[]
  instructor?: {
    prenom: string | null
    nom: string | null
  }
}

export interface EnrollmentSummary {
  id: string
  userId: string
  courseId: string
  progress: number
}

// ⚠️ Importation différée (évite le cycle)
import type { ChapterWithRelations } from './chapter'

// ============================================================
// DTOs
// ============================================================

export interface CreateCourseDto {
  title: string
  description?: string
  category?: string
  level?: string
  price?: number
  isPublished?: boolean
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}