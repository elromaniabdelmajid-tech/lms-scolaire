import type { ApiClient } from '../client'
import type {
  Resource,
  CreateResourceDto,
  UpdateResourceDto,
} from '@lms-scolaire/shared'

export class ResourcesResource {
  constructor(private readonly client: ApiClient) {}

  async listByChapter(chapterId: string): Promise<Resource[]> {
    return this.client.get<Resource[]>(`/chapters/${chapterId}/resources`)
  }

  async getById(id: string): Promise<Resource> {
    return this.client.get<Resource>(`/resources/${id}`)
  }

  async create(chapterId: string, dto: CreateResourceDto): Promise<Resource> {
    return this.client.post<Resource>(
      `/chapters/${chapterId}/resources`,
      dto,
    )
  }

  async update(id: string, dto: UpdateResourceDto): Promise<Resource> {
    return this.client.put<Resource>(`/resources/${id}`, dto)
  }

  async delete(id: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(`/resources/${id}`)
  }
}