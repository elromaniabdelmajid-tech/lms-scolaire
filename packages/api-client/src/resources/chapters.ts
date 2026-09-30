import type { ApiClient } from '../client'
import type {
  Chapter,
  ChapterWithRelations,
  CreateChapterDto,
  UpdateChapterDto,
} from '@lms-scolaire/shared'

export class ChaptersResource {
  constructor(private readonly client: ApiClient) {}

  async listByCourse(courseId: string): Promise<ChapterWithRelations[]> {
    return this.client.get<ChapterWithRelations[]>(
      `/courses/${courseId}/chapters`,
    )
  }

  async getById(id: string): Promise<ChapterWithRelations> {
    return this.client.get<ChapterWithRelations>(`/chapters/${id}`)
  }

  async create(courseId: string, dto: CreateChapterDto): Promise<Chapter> {
    return this.client.post<Chapter>(`/courses/${courseId}/chapters`, dto)
  }

  async update(id: string, dto: UpdateChapterDto): Promise<Chapter> {
    return this.client.put<Chapter>(`/chapters/${id}`, dto)
  }
}