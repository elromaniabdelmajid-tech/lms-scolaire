export interface Progress {
  id: string
  userId: string
  chapterId: string
  isCompleted: boolean
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface ProgressWithChapter extends Progress {
  chapter: {
    id: string
    title: string
    position: number
  }
}

export interface ToggleProgressDto {
  chapterId: string
  courseId: string
  isCompleted: boolean
}