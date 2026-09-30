import type { ApiClient } from '../client'
import type {
  Course,
  CourseWithRelations,
  CreateCourseDto,
  UpdateCourseDto,
} from '@lms-scolaire/shared'

export class CoursesResource {
  constructor(private readonly client: ApiClient) {}

  async list(): Promise<CourseWithRelations[]> {
    return this.client.get<CourseWithRelations[]>('/courses')
  }

  async getById(id: string): Promise<Course> {
    return this.client.get<Course>(`/courses/${id}`)
  }

  async create(dto: CreateCourseDto): Promise<Course> {
    return this.client.post<Course>('/courses', dto)
  }

  async update(id: string, dto: UpdateCourseDto): Promise<Course> {
    return this.client.put<Course>(`/courses/${id}`, dto)
  }
  async getTeacherDashboard(): Promise<any> {
  return this.client.get('/courses/enseignant/dashboard')
}
}