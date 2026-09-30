import type { ApiClient } from '../client'

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

export class ProgressResource {
  constructor(private readonly client: ApiClient) {}

  /**
   * Toggle (marquer/démarquer) un chapitre comme terminé
   */
  async toggle(dto: ToggleProgressDto): Promise<Progress> {
    return this.client.post<Progress>('/student/progress', dto)
  }

  /**
   * Récupérer la progression d'un élève sur un cours
   */
  async getByCourse(courseId: string): Promise<ProgressWithChapter[]> {
    return this.client.get<ProgressWithChapter[]>(
      `/student/progress/${courseId}`,
    )
  }
}