import type { ApiClient } from '../client'

export class StudentResource {
  constructor(private readonly client: ApiClient) {}

  async getDashboard(): Promise<any> {
    return this.client.get('/student/dashboard')
  }
  
    async getCourse(courseId: string): Promise<any> {
    return this.client.get(`/student/courses/${courseId}`)
  }
    async getChapter(chapterId: string): Promise<any> {
    return this.client.get(`/student/chapters/${chapterId}`)
  }
    async getQuiz(quizId: string): Promise<any> {
    return this.client.get(`/student/quizzes/${quizId}`)
  }
    async getConversations(): Promise<any> {
    return this.client.get('/student/conversations')
  }
  
    async getGamification(): Promise<any> {
    return this.client.get('/student/gamification')
  }
    async getConversation(conversationId: string): Promise<any> {
    return this.client.get(`/student/conversations/${conversationId}`)
  }
}