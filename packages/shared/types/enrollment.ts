export interface Enrollment {
  id: string
  userId: string
  courseId: string
  progress: number
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface EnrollmentWithCourse extends Enrollment {
  course: {
    id: string
    title: string
    description: string | null
    image: string | null
    category: string | null
    level: string | null
    instructor?: {
      prenom: string | null
      nom: string | null
    }
  }
}

export interface EnrollResult {
  success: boolean
  message: string
  enrollment: EnrollmentWithCourse
}

export interface CreateEnrollmentDto {
  courseId: string
}