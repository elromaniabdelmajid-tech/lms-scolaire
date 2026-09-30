import type { ApiClient } from '../client'
import type {
  Enrollment,
  EnrollmentWithCourse,
  EnrollResult,
  CreateEnrollmentDto,
} from '@lms-scolaire/shared'

export class EnrollmentsResource {
  constructor(private readonly client: ApiClient) {}

  async list(): Promise<EnrollmentWithCourse[]> {
    return this.client.get<EnrollmentWithCourse[]>('/student/enrollments')
  }

  async getByCourseId(courseId: string): Promise<Enrollment> {
    return this.client.get<Enrollment>(
      `/student/enrollments/${courseId}`,
    )
  }

  async enroll(dto: CreateEnrollmentDto): Promise<EnrollResult> {
    return this.client.post<EnrollResult>('/student/enrollments', dto)
  }

  async unenroll(courseId: string): Promise<{ success: boolean }> {
    return this.client.delete<{ success: boolean }>(
      `/student/enrollments/${courseId}`,
    )
  }
}